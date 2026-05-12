#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CATALOG="$REPO_ROOT/docs/enterprise/catalog.json"
EXCLUSION_FILE="$SCRIPT_DIR/excluded-packages.txt"
OUTPUT_DIR="$SCRIPT_DIR/output"

# Flags
VERBOSE=false
EL_ONLY=false
DEB_ONLY=false
DISCOVER_ONLY=false
SELF_TEST=false

usage() {
    cat <<'USAGE'
Usage: discover-repo-packages.sh [OPTIONS]

Discover packages in the pgEdge DNF/APT repos, diff against catalog.json,
and interactively add new packages to the catalog.

Options:
    --verbose        List excluded packages individually
    --el-only        Skip Debian container
    --deb-only       Skip EL container
    --discover-only  Print diff summary and exit (no interactive walkthrough)
    --self-test      Run self-test with canned fixtures (no Docker needed)
    -h, --help       Show this help
USAGE
    exit 0
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --verbose)      VERBOSE=true; shift ;;
        --el-only)      EL_ONLY=true; shift ;;
        --deb-only)     DEB_ONLY=true; shift ;;
        --discover-only) DISCOVER_ONLY=true; shift ;;
        --self-test)    SELF_TEST=true; shift ;;
        -h|--help)      usage ;;
        *)              echo "Unknown option: $1"; usage ;;
    esac
done

# ── Exclusion matching ──────────────────────────────────────────────

load_exclusions() {
    local file="$1"
    EXCLUSION_PATTERNS=()
    [[ -f "$file" ]] || return 0
    while IFS= read -r line; do
        line="${line%%#*}"
        line="${line// /}"
        [[ -z "$line" ]] && continue
        EXCLUSION_PATTERNS+=("$line")
    done < "$file"
}

is_excluded() {
    local pkg="$1"
    for pattern in "${EXCLUSION_PATTERNS[@]}"; do
        # shellcheck disable=SC2053
        if [[ "$pkg" == $pattern ]]; then
            return 0
        fi
    done
    return 1
}

# ── PG-version detection ────────────────────────────────────────────

# Given a list of package names (one per line), detect whether a base
# package is standalone or has PG-version-specific variants.
#
# Input:  newline-separated package names
# Output: lines of "base_name|standalone" or "base_name|16,17,18"
#
# Detection logic:
#   - If variants like pgedge-foo_16, pgedge-foo_17, pgedge-foo_18 exist
#     (RPM style with underscore), it's PG-versioned.
#   - If variants like pgedge-postgresql-16-foo exist (DEB style), it's
#     PG-versioned.
#   - Otherwise it's standalone.

detect_pg_versions() {
    local packages="$1"
    local pg_versions=("16" "17" "18")
    local -A seen_bases

    while IFS= read -r pkg; do
        [[ -z "$pkg" ]] && continue
        local base=""
        local ver=""

        # RPM style: pgedge-foo_16 or pgedge-foo_{ver}
        for v in "${pg_versions[@]}"; do
            if [[ "$pkg" == *"_${v}" ]]; then
                base="${pkg%_${v}}"
                ver="$v"
                break
            fi
            # Also check pgedge-postgresql{ver} pattern (no separator)
            if [[ "$pkg" == *"postgresql${v}"* ]]; then
                base="${pkg//postgresql${v}/postgresql{ver}}"
                ver="$v"
                break
            fi
        done

        # DEB style: pgedge-postgresql-16-foo
        if [[ -z "$ver" ]]; then
            for v in "${pg_versions[@]}"; do
                if [[ "$pkg" =~ pgedge-postgresql-${v}-(.*) ]]; then
                    base="pgedge-postgresql-{ver}-${BASH_REMATCH[1]}"
                    ver="$v"
                    break
                fi
                # DEB client/plperl style: pgedge-postgresql-foo-16
                if [[ "$pkg" =~ (pgedge-postgresql-[a-z0-9]+)-${v}$ ]]; then
                    base="${BASH_REMATCH[1]}-{ver}"
                    ver="$v"
                    break
                fi
            done
        fi

        if [[ -z "$ver" ]]; then
            # Standalone package
            seen_bases["$pkg"]="standalone"
        else
            if [[ -n "${seen_bases[$base]+x}" && "${seen_bases[$base]}" != "standalone" ]]; then
                seen_bases["$base"]="${seen_bases[$base]},$ver"
            else
                seen_bases["$base"]="$ver"
            fi
        fi
    done <<< "$packages"

    for base in "${!seen_bases[@]}"; do
        echo "${base}|${seen_bases[$base]}"
    done | sort
}

# ── Catalog extraction ──────────────────────────────────────────────

extract_catalog_names() {
    local catalog_file="$1"
    local field="$2"
    jq -r --arg f "$field" '
        .categories[].packages[]
        | select(.[$f] != null and .[$f] != "")
        | .[$f]
    ' "$catalog_file"
}

expand_versioned_name() {
    local pattern="$1"
    local pg_versions=("16" "17" "18")
    if [[ "$pattern" == *"{ver}"* ]]; then
        for v in "${pg_versions[@]}"; do
            echo "${pattern//\{ver\}/$v}"
        done
    else
        echo "$pattern"
    fi
}

extract_all_catalog_packages() {
    local catalog_file="$1"
    local field="$2"
    local names
    names=$(extract_catalog_names "$catalog_file" "$field")
    while IFS= read -r name; do
        [[ -z "$name" ]] && continue
        expand_versioned_name "$name"
    done <<< "$names"
}

# ── Meta-package parsing ────────────────────────────────────────────

parse_metapkg_deps() {
    local deps_file="$1"
    local section=""
    METAPKG_FULL=()
    METAPKG_MINIMAL=()
    while IFS= read -r line; do
        if [[ "$line" == "=== full ===" ]]; then
            section="full"; continue
        elif [[ "$line" == "=== minimal ===" ]]; then
            section="minimal"; continue
        fi
        [[ -z "$line" ]] && continue
        case "$section" in
            full)    METAPKG_FULL+=("$line") ;;
            minimal) METAPKG_MINIMAL+=("$line") ;;
        esac
    done < "$deps_file"
}

pkg_in_metapkg() {
    local pkg="$1"
    local -n arr="$2"
    for dep in "${arr[@]}"; do
        if [[ "$dep" == "$pkg" || "$dep" == *"$pkg"* ]]; then
            return 0
        fi
    done
    return 1
}

# ── Diff engine ─────────────────────────────────────────────────────

run_diff() {
    local catalog_file="$1"
    local el_file="$2"
    local deb_file="$3"
    local exclusion_file="$4"

    load_exclusions "$exclusion_file"

    # Build sets of known catalog package names
    local -A catalog_rpm_set
    local -A catalog_deb_set
    while IFS= read -r name; do
        [[ -z "$name" ]] && continue
        catalog_rpm_set["$name"]=1
    done <<< "$(extract_all_catalog_packages "$catalog_file" "rpm_name")"
    while IFS= read -r name; do
        [[ -z "$name" ]] && continue
        catalog_deb_set["$name"]=1
    done <<< "$(extract_all_catalog_packages "$catalog_file" "deb_name")"

    # Build sets of discovered packages
    local -A el_set
    local -A deb_set
    if [[ -f "$el_file" ]]; then
        while IFS= read -r pkg; do
            [[ -z "$pkg" ]] && continue
            el_set["$pkg"]=1
        done < "$el_file"
    fi
    if [[ -f "$deb_file" ]]; then
        while IFS= read -r pkg; do
            [[ -z "$pkg" ]] && continue
            deb_set["$pkg"]=1
        done < "$deb_file"
    fi

    # Diff: check discovered against catalog
    local -A new_pkgs
    local -A matched_pkgs
    local excluded_count=0
    local -a excluded_list

    # Check EL packages
    for pkg in "${!el_set[@]}"; do
        if is_excluded "$pkg"; then
            ((excluded_count += 1))
            excluded_list+=("$pkg")
            continue
        fi
        if [[ -n "${catalog_rpm_set[$pkg]+x}" ]]; then
            matched_pkgs["$pkg"]="el"
        else
            new_pkgs["$pkg"]="${new_pkgs[$pkg]+${new_pkgs[$pkg]},}el"
        fi
    done

    # Check DEB packages
    for pkg in "${!deb_set[@]}"; do
        if is_excluded "$pkg"; then
            ((excluded_count += 1))
            excluded_list+=("$pkg")
            continue
        fi
        if [[ -n "${catalog_deb_set[$pkg]+x}" ]]; then
            if [[ -n "${matched_pkgs[$pkg]+x}" ]]; then
                matched_pkgs["$pkg"]="${matched_pkgs[$pkg]},deb"
            else
                matched_pkgs["$pkg"]="deb"
            fi
        else
            if [[ -n "${new_pkgs[$pkg]+x}" ]]; then
                new_pkgs["$pkg"]="${new_pkgs[$pkg]},deb"
            else
                new_pkgs["$pkg"]="deb"
            fi
        fi
    done

    # Check for MISSING (in catalog but not in repo)
    local -A missing_pkgs
    for name in "${!catalog_rpm_set[@]}"; do
        if [[ -z "${el_set[$name]+x}" ]] && [[ -f "$el_file" ]]; then
            missing_pkgs["$name"]=1
        fi
    done
    for name in "${!catalog_deb_set[@]}"; do
        if [[ -z "${deb_set[$name]+x}" ]] && [[ -f "$deb_file" ]]; then
            missing_pkgs["$name"]=1
        fi
    done

    # Store results in global arrays for use by other functions
    DIFF_NEW_PKGS=()
    DIFF_NEW_SOURCES=()
    DIFF_MATCHED_PKGS=()
    DIFF_MISSING_PKGS=()
    DIFF_EXCLUDED_COUNT=$excluded_count
    DIFF_EXCLUDED_LIST=("${excluded_list[@]+"${excluded_list[@]}"}")

    for pkg in $(echo "${!new_pkgs[@]}" | tr ' ' '\n' | sort); do
        DIFF_NEW_PKGS+=("$pkg")
        DIFF_NEW_SOURCES+=("${new_pkgs[$pkg]}")
    done
    for pkg in $(echo "${!matched_pkgs[@]}" | tr ' ' '\n' | sort); do
        DIFF_MATCHED_PKGS+=("$pkg")
    done
    for pkg in $(echo "${!missing_pkgs[@]}" | tr ' ' '\n' | sort); do
        DIFF_MISSING_PKGS+=("$pkg")
    done
}

print_diff_summary() {
    local el_file="$1"
    local deb_file="$2"

    local el_count=0
    local deb_count=0
    [[ -f "$el_file" ]] && el_count=$(wc -l < "$el_file" | tr -d ' ')
    [[ -f "$deb_file" ]] && deb_count=$(wc -l < "$deb_file" | tr -d ' ')

    echo "=== pgEdge Repository Discovery ==="
    echo "Date: $(date +%Y-%m-%d)"
    echo "EL packages found: $el_count"
    echo "DEB packages found: $deb_count"
    echo ""
    echo "=== DIFF vs catalog.json ==="

    for i in "${!DIFF_NEW_PKGS[@]}"; do
        printf "[NEW]      %s (found in: %s)\n" "${DIFF_NEW_PKGS[$i]}" "${DIFF_NEW_SOURCES[$i]}"
    done
    for pkg in "${DIFF_MATCHED_PKGS[@]}"; do
        printf "[MATCH]    %s\n" "$pkg"
    done
    for pkg in "${DIFF_MISSING_PKGS[@]}"; do
        printf "[MISSING]  %s (in catalog but not found in repo)\n" "$pkg"
    done

    if [[ $DIFF_EXCLUDED_COUNT -gt 0 ]]; then
        printf "[EXCLUDED] %d packages matched exclusion rules" "$DIFF_EXCLUDED_COUNT"
        if [[ "$VERBOSE" == true ]]; then
            echo ":"
            for pkg in "${DIFF_EXCLUDED_LIST[@]}"; do
                echo "           $pkg"
            done
        else
            echo " (use --verbose to list)"
        fi
    fi
}

# ── Interactive catalog update ──────────────────────────────────────

get_categories() {
    local catalog_file="$1"
    jq -r '.categories[].name' "$catalog_file"
}

interactive_walkthrough() {
    local catalog_file="$1"
    local exclusion_file="$2"
    local el_deps_file="$3"
    local deb_deps_file="$4"

    if [[ ${#DIFF_NEW_PKGS[@]} -eq 0 ]]; then
        echo "No new packages to process."
        return 0
    fi

    # Parse meta-package deps from both EL and DEB
    parse_metapkg_deps "$el_deps_file"
    local -a EL_FULL=("${METAPKG_FULL[@]}")
    local -a EL_MINIMAL=("${METAPKG_MINIMAL[@]}")
    parse_metapkg_deps "$deb_deps_file"
    local -a DEB_FULL=("${METAPKG_FULL[@]}")
    local -a DEB_MINIMAL=("${METAPKG_MINIMAL[@]}")

    # Combine all new packages into a newline-separated string
    local new_pkgs_str
    new_pkgs_str=$(printf "%s\n" "${DIFF_NEW_PKGS[@]}")

    # Group by base name using detect_pg_versions
    local grouped
    grouped=$(detect_pg_versions "$new_pkgs_str")

    # Collect categories
    local -a categories
    while IFS= read -r cat_name; do
        [[ -z "$cat_name" ]] && continue
        categories+=("$cat_name")
    done <<< "$(get_categories "$catalog_file")"

    # Accumulators
    local -a additions_json=()
    local -a additions_cat=()
    local -a new_exclusions=()

    local add_count=0
    local exclude_count=0
    local skip_count=0

    # Use fd 3 for reading grouped package lines so that stdin (fd 0)
    # remains available for read -r prompts inside the loop.
    local grouped_tmp
    grouped_tmp=$(mktemp)
    printf '%s\n' "$grouped" > "$grouped_tmp"

    while IFS='|' read -r base_name versions <&3; do
        [[ -z "$base_name" ]] && continue

        # Determine RPM and DEB names
        local rpm_name deb_name pg_versions_arr is_versioned
        if [[ "$versions" == "standalone" ]]; then
            is_versioned=false
            rpm_name="$base_name"
            deb_name="$base_name"
            pg_versions_arr='["all"]'
        else
            is_versioned=true
            # For RPM: base_name is like pgedge-newext → pgedge-newext_{ver}
            # For DEB: need to check if there's a DEB-style base
            # If base_name matches pgedge-postgresql-{ver}-foo, use that as deb_name
            if [[ "$base_name" == pgedge-postgresql-* ]]; then
                # This is a DEB-style base; treat as DEB name pattern
                deb_name="${base_name}"
                # Derive RPM name: pgedge-postgresql-{ver}-foo → pgedge-foo_{ver}
                local suffix="${base_name#pgedge-postgresql-\{ver\}-}"
                rpm_name="pgedge-${suffix}_{ver}"
            else
                rpm_name="${base_name}_{ver}"
                deb_name="pgedge-postgresql-{ver}-${base_name#pgedge-}"
            fi
            # Build pg_versions JSON array
            local pg_ver_json
            pg_ver_json=$(echo "$versions" | tr ',' '\n' \
                | jq -R . | jq -sc .)
            pg_versions_arr="$pg_ver_json"
        fi

        # Determine included_in from meta-package deps
        local included_in_arr
        local -a included_in_list=()

        # Check against EL metapkg using rpm_name (expand {ver} to check)
        local check_name="${rpm_name//\{ver\}/18}"
        # Also check the raw base name
        local in_full=false
        local in_minimal=false

        for dep in "${EL_FULL[@]}" "${DEB_FULL[@]}"; do
            if [[ "$dep" == "$check_name" || "$dep" == *"$base_name"* \
                  || "$dep" == "$base_name" ]]; then
                in_full=true
                break
            fi
        done
        for dep in "${EL_MINIMAL[@]}" "${DEB_MINIMAL[@]}"; do
            if [[ "$dep" == "$check_name" || "$dep" == *"$base_name"* \
                  || "$dep" == "$base_name" ]]; then
                in_minimal=true
                break
            fi
        done

        [[ "$in_full" == true ]] && included_in_list+=("full")
        [[ "$in_minimal" == true ]] && included_in_list+=("minimal")
        if [[ ${#included_in_list[@]} -gt 0 ]]; then
            included_in_arr=$(printf '%s\n' "${included_in_list[@]}" \
                | jq -R . | jq -sc .)
        else
            included_in_arr='[]'
        fi

        # Describe meta-package membership
        local meta_desc
        if [[ "$in_full" == true && "$in_minimal" == true ]]; then
            meta_desc="full + minimal"
        elif [[ "$in_full" == true ]]; then
            meta_desc="full"
        elif [[ "$in_minimal" == true ]]; then
            meta_desc="minimal"
        else
            meta_desc="none"
        fi

        # Display info
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "NEW PACKAGE: $base_name"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        printf "  RPM name:    %s\n" "$rpm_name"
        printf "  DEB name:    %s\n" "$deb_name"
        if [[ "$is_versioned" == true ]]; then
            printf "  PG-specific: yes (%s)\n" "$versions"
        else
            printf "  PG-specific: no (standalone)\n"
        fi
        printf "  In meta-pkg: %s\n" "$meta_desc"

        echo ""
        echo "  [1] Add to catalog"
        echo "  [2] Exclude (add to excluded-packages.txt)"
        echo "  [3] Skip for now"
        printf "  Choice: "
        local choice
        read -r choice

        case "$choice" in
            1)
                # Show category list
                echo ""
                echo "  Category?"
                local i=1
                for cat_name in "${categories[@]}"; do
                    printf "  [%d] %s\n" "$i" "$cat_name"
                    ((i++))
                done
                printf "  Choice: "
                local cat_choice
                read -r cat_choice

                local selected_cat=""
                if [[ "$cat_choice" =~ ^[0-9]+$ ]] \
                    && [[ "$cat_choice" -ge 1 ]] \
                    && [[ "$cat_choice" -le "${#categories[@]}" ]]; then
                    selected_cat="${categories[$((cat_choice - 1))]}"
                else
                    echo "  Invalid category choice; skipping."
                    ((skip_count += 1))
                    continue
                fi

                printf "\n  Display name (e.g., \"Radar\"): "
                local display_name
                read -r display_name

                printf "\n  Description: "
                local description
                read -r description

                # Build JSON entry
                local entry_json
                entry_json=$(jq -n \
                    --arg name "$display_name" \
                    --arg desc "$description" \
                    --arg rpm  "$rpm_name" \
                    --arg deb  "$deb_name" \
                    --argjson pgv "$pg_versions_arr" \
                    --argjson inc "$included_in_arr" \
                    '{
                        name: $name,
                        description: $desc,
                        rpm_name: $rpm,
                        deb_name: $deb,
                        pg_versions: $pgv,
                        included_in: $inc
                    }')

                additions_json+=("$entry_json")
                additions_cat+=("$selected_cat")

                printf "\n  Adding to catalog.json → %s\n" "$selected_cat"
                echo "  ✓ Done"
                ((add_count += 1))
                ;;
            2)
                new_exclusions+=("$base_name")
                echo "  Added '$base_name' to exclusion list."
                ((exclude_count += 1))
                ;;
            3)
                echo "  Skipped."
                ((skip_count += 1))
                ;;
            *)
                echo "  Unrecognised choice; skipping."
                ((skip_count += 1))
                ;;
        esac
    done 3< "$grouped_tmp"
    rm -f "$grouped_tmp"

    # Write additions to catalog file
    if [[ ${#additions_json[@]} -gt 0 ]]; then
        local temp_catalog
        temp_catalog=$(mktemp)
        cp "$catalog_file" "$temp_catalog"

        local idx=0
        for entry_json in "${additions_json[@]}"; do
            local cat_name="${additions_cat[$idx]}"
            local temp_catalog_new
            temp_catalog_new=$(mktemp)
            jq --indent 2 \
                --arg cat "$cat_name" \
                --argjson entry "$entry_json" '
                .categories |= map(
                    if .name == $cat then .packages += [$entry] else . end
                )
            ' "$temp_catalog" > "$temp_catalog_new"
            mv "$temp_catalog_new" "$temp_catalog"
            ((idx += 1))
        done

        mv "$temp_catalog" "$catalog_file"
        echo ""
        echo "Catalog updated: $catalog_file"
    fi

    # Append new exclusions
    if [[ ${#new_exclusions[@]} -gt 0 ]]; then
        printf "%s\n" "${new_exclusions[@]}" >> "$exclusion_file"
        echo "Exclusions appended: $exclusion_file"
    fi

    echo ""
    echo "Summary: $add_count added, $exclude_count excluded, $skip_count skipped."
}

# ── Docker discovery ────────────────────────────────────────────────

check_docker() {
    if ! command -v docker &>/dev/null; then
        echo "ERROR: Docker is not installed or not in PATH."
        exit 1
    fi
    if ! docker info &>/dev/null; then
        echo "ERROR: Docker daemon is not running."
        exit 1
    fi
}

discover_el() {
    local output_dir="$1"
    echo "=== Discovering EL packages (rockylinux:9) ==="

    mkdir -p "$output_dir"

    docker run --rm rockylinux:9 bash -c '
        dnf install -y epel-release > /dev/null 2>&1
        dnf config-manager --set-enabled crb > /dev/null 2>&1
        dnf install -y https://dnf.pgedge.com/reporpm/pgedge-release-latest.noarch.rpm > /dev/null 2>&1
        echo "=== PACKAGES ==="
        dnf repoquery --available --repo=pgedge --repo=pgedge-noarch 2>/dev/null | sort
        echo "=== METAPKG_FULL ==="
        echo "=== full ==="
        dnf repoquery --requires pgedge-enterprise-all_18 2>/dev/null | grep "^pgedge-" | sort
        echo "=== minimal ==="
        dnf repoquery --requires pgedge-enterprise-postgres_18 2>/dev/null | grep "^pgedge-" | sort
    ' > "$output_dir/el-raw.txt" 2>&1

    # Split raw output into separate files
    local in_packages=false
    local in_metapkg=false
    > "$output_dir/rocky9-packages.txt"
    > "$output_dir/rocky9-metapkg-deps.txt"

    while IFS= read -r line; do
        if [[ "$line" == "=== PACKAGES ===" ]]; then
            in_packages=true; in_metapkg=false; continue
        elif [[ "$line" == "=== METAPKG_FULL ===" ]]; then
            in_packages=false; in_metapkg=true; continue
        fi
        if [[ "$in_packages" == true ]]; then
            # Strip version-release suffix if present (e.g., pgedge-radar-0:0.4.1-1.el9.x86_64)
            local pkg_name
            pkg_name=$(echo "$line" | sed 's/-[0-9]*:.*$//' | sed 's/\.[a-z0-9_]*$//')
            [[ -n "$pkg_name" ]] && echo "$pkg_name"
        elif [[ "$in_metapkg" == true ]]; then
            echo "$line" >> "$output_dir/rocky9-metapkg-deps.txt"
        fi
    done < "$output_dir/el-raw.txt" | sort -u > "$output_dir/rocky9-packages.txt"

    rm -f "$output_dir/el-raw.txt"
    local count
    count=$(wc -l < "$output_dir/rocky9-packages.txt" | tr -d ' ')
    echo "  Found $count unique EL packages"
}

discover_deb() {
    local output_dir="$1"
    echo "=== Discovering DEB packages (debian:bookworm) ==="

    mkdir -p "$output_dir"

    docker run --rm debian:bookworm bash -c '
        apt-get update > /dev/null 2>&1
        apt-get install -y curl gnupg2 lsb-release > /dev/null 2>&1
        curl -sSL https://apt.pgedge.com/repodeb/pgedge-release_latest_all.deb -o /tmp/pgedge-release.deb
        dpkg -i /tmp/pgedge-release.deb > /dev/null 2>&1
        apt-get update > /dev/null 2>&1
        echo "=== PACKAGES ==="
        apt list 2>/dev/null | grep "^pgedge-" | cut -d/ -f1 | sort
        echo "=== METAPKG_FULL ==="
        echo "=== full ==="
        apt-cache depends pgedge-enterprise-all-18 2>/dev/null | grep "Depends:" | awk "{print \$2}" | grep "^pgedge-" | sort
        echo "=== minimal ==="
        apt-cache depends pgedge-enterprise-postgres-18 2>/dev/null | grep "Depends:" | awk "{print \$2}" | grep "^pgedge-" | sort
    ' > "$output_dir/deb-raw.txt" 2>&1

    # Split raw output
    local in_packages=false
    local in_metapkg=false
    > "$output_dir/debian12-packages.txt"
    > "$output_dir/debian12-metapkg-deps.txt"

    while IFS= read -r line; do
        if [[ "$line" == "=== PACKAGES ===" ]]; then
            in_packages=true; in_metapkg=false; continue
        elif [[ "$line" == "=== METAPKG_FULL ===" ]]; then
            in_packages=false; in_metapkg=true; continue
        fi
        if [[ "$in_packages" == true && -n "$line" ]]; then
            echo "$line" >> "$output_dir/debian12-packages.txt"
        elif [[ "$in_metapkg" == true ]]; then
            echo "$line" >> "$output_dir/debian12-metapkg-deps.txt"
        fi
    done < "$output_dir/deb-raw.txt"

    rm -f "$output_dir/deb-raw.txt"
    local count
    count=$(wc -l < "$output_dir/debian12-packages.txt" | tr -d ' ')
    echo "  Found $count DEB packages"
}

# ── Self-test function ──────────────────────────────────────────────

test_exclusion_matching() {
    local fixture_dir="$SCRIPT_DIR/test-fixtures"
    load_exclusions "$fixture_dir/excluded-test.txt"

    local pass=0
    local fail=0

    # Should be excluded
    for pkg in "pgedge-release" "pgedge-postgresql18-devel" "pgedge-spock50-debuginfo"; do
        if is_excluded "$pkg"; then
            ((pass += 1))
        else
            echo "  FAIL: expected '$pkg' to be excluded"
            ((fail += 1))
        fi
    done

    # Should NOT be excluded
    for pkg in "pgedge-pgadmin4" "pgedge-radar" "pgedge-spock50_18"; do
        if is_excluded "$pkg"; then
            echo "  FAIL: expected '$pkg' to NOT be excluded"
            ((fail += 1))
        else
            ((pass += 1))
        fi
    done

    if [[ $fail -eq 0 ]]; then
        echo "[PASS] Exclusion glob matching ($pass/$pass patterns)"
        return 0
    else
        echo "[FAIL] Exclusion glob matching ($pass pass, $fail fail)"
        return 1
    fi
}

test_pg_version_detection() {
    local test_packages
    test_packages=$(cat <<'EOF'
pgedge-radar
pgedge-pgadmin4
pgedge-spock50_16
pgedge-spock50_17
pgedge-spock50_18
pgedge-pgvector_16
pgedge-pgvector_17
EOF
)

    local result
    result=$(detect_pg_versions "$test_packages")

    local pass=0
    local fail=0

    # pgedge-radar should be standalone
    if echo "$result" | grep -q "pgedge-radar|standalone"; then
        ((pass += 1))
    else
        echo "  FAIL: expected pgedge-radar to be standalone"
        ((fail += 1))
    fi

    # pgedge-pgadmin4 should be standalone
    if echo "$result" | grep -q "pgedge-pgadmin4|standalone"; then
        ((pass += 1))
    else
        echo "  FAIL: expected pgedge-pgadmin4 to be standalone"
        ((fail += 1))
    fi

    # pgedge-spock50 should have 16,17,18
    if echo "$result" | grep -q "pgedge-spock50|16,17,18"; then
        ((pass += 1))
    else
        echo "  FAIL: expected pgedge-spock50 to have versions 16,17,18"
        echo "  Got: $(echo "$result" | grep spock50)"
        ((fail += 1))
    fi

    # pgedge-pgvector should have 16,17 (only two in test data)
    if echo "$result" | grep -q "pgedge-pgvector|16,17"; then
        ((pass += 1))
    else
        echo "  FAIL: expected pgedge-pgvector to have versions 16,17"
        echo "  Got: $(echo "$result" | grep pgvector)"
        ((fail += 1))
    fi

    if [[ $fail -eq 0 ]]; then
        echo "[PASS] PG-version detection (standalone vs versioned)"
        return 0
    else
        echo "[FAIL] PG-version detection ($pass pass, $fail fail)"
        return 1
    fi
}

test_diff_engine() {
    local fixture_dir="$SCRIPT_DIR/test-fixtures"
    run_diff \
        "$fixture_dir/catalog-test.json" \
        "$fixture_dir/el-packages.txt" \
        "$fixture_dir/deb-packages.txt" \
        "$fixture_dir/excluded-test.txt"

    local pass=0
    local fail=0

    local new_count=${#DIFF_NEW_PKGS[@]}
    local match_count=${#DIFF_MATCHED_PKGS[@]}
    local missing_count=${#DIFF_MISSING_PKGS[@]}
    local excluded_count=$DIFF_EXCLUDED_COUNT

    # Expect: 2+ NEW (radar + newext variants), 4+ MATCH, 1 MISSING (gone-pkg), 2+ EXCLUDED
    if [[ $new_count -ge 2 ]]; then ((pass += 1)); else
        echo "  FAIL: expected >=2 NEW, got $new_count"
        ((fail += 1))
    fi
    if [[ $match_count -ge 4 ]]; then ((pass += 1)); else
        echo "  FAIL: expected >=4 MATCH, got $match_count"
        ((fail += 1))
    fi
    if [[ $missing_count -ge 1 ]]; then ((pass += 1)); else
        echo "  FAIL: expected >=1 MISSING, got $missing_count"
        ((fail += 1))
    fi
    if [[ $excluded_count -ge 2 ]]; then ((pass += 1)); else
        echo "  FAIL: expected >=2 EXCLUDED, got $excluded_count"
        ((fail += 1))
    fi

    if [[ $fail -eq 0 ]]; then
        echo "[PASS] Diff: ${new_count} NEW, ${match_count} MATCH, ${missing_count} MISSING, ${excluded_count} EXCLUDED"
        return 0
    else
        echo "[FAIL] Diff engine ($pass pass, $fail fail)"
        return 1
    fi
}

test_metapkg_parsing() {
    local fixture_dir="$SCRIPT_DIR/test-fixtures"

    parse_metapkg_deps "$fixture_dir/el-metapkg-deps.txt"

    local pass=0
    local fail=0

    # Full should contain radar and pgadmin4
    if pkg_in_metapkg "pgedge-radar" METAPKG_FULL; then ((pass += 1)); else
        echo "  FAIL: expected pgedge-radar in full meta-package"
        ((fail += 1))
    fi
    if pkg_in_metapkg "pgedge-pgadmin4" METAPKG_FULL; then ((pass += 1)); else
        echo "  FAIL: expected pgedge-pgadmin4 in full meta-package"
        ((fail += 1))
    fi

    # Minimal should NOT contain radar or pgadmin4
    if ! pkg_in_metapkg "pgedge-radar" METAPKG_MINIMAL; then ((pass += 1)); else
        echo "  FAIL: expected pgedge-radar NOT in minimal meta-package"
        ((fail += 1))
    fi
    if ! pkg_in_metapkg "pgedge-pgadmin4" METAPKG_MINIMAL; then ((pass += 1)); else
        echo "  FAIL: expected pgedge-pgadmin4 NOT in minimal meta-package"
        ((fail += 1))
    fi

    # Minimal should contain spock
    if pkg_in_metapkg "pgedge-spock50_18" METAPKG_MINIMAL; then ((pass += 1)); else
        echo "  FAIL: expected pgedge-spock50_18 in minimal meta-package"
        ((fail += 1))
    fi

    if [[ $fail -eq 0 ]]; then
        echo "[PASS] Meta-package parsing (full + minimal)"
        return 0
    else
        echo "[FAIL] Meta-package parsing ($pass pass, $fail fail)"
        return 1
    fi
}

test_catalog_write() {
    local fixture_dir="$SCRIPT_DIR/test-fixtures"

    # Run diff against test fixtures to populate DIFF_NEW_PKGS
    run_diff \
        "$fixture_dir/catalog-test.json" \
        "$fixture_dir/el-packages.txt" \
        "$fixture_dir/deb-packages.txt" \
        "$fixture_dir/excluded-test.txt"

    # Count original packages in catalog-test.json
    local orig_count
    orig_count=$(jq '[.categories[].packages[]] | length' \
        "$fixture_dir/catalog-test.json")

    # Work on a temp copy of the catalog
    local temp_catalog
    temp_catalog=$(mktemp /tmp/catalog-test-XXXXXX.json)
    cp "$fixture_dir/catalog-test.json" "$temp_catalog"

    # Work on a temp copy of the exclusion file
    local temp_excl
    temp_excl=$(mktemp)
    cp "$fixture_dir/excluded-test.txt" "$temp_excl"

    # detect_pg_versions sorts output alphabetically; the order is:
    #   1. pgedge-newext|16,17,18         → Add → Core (1) → "New Extension" → "A new extension"
    #   2. pgedge-postgresql-{ver}-newext|16,17,18 → Skip (3)
    #   3. pgedge-radar|standalone         → Add → Management Tools (2) → "Radar" → "Cluster health monitoring"
    #
    # Category list from catalog-test.json: [1] Core, [2] Management Tools
    local sim_input
    sim_input=$(printf '%s\n' \
        "1" \
        "1" \
        "New Extension" \
        "A new extension" \
        "3" \
        "1" \
        "2" \
        "Radar" \
        "Cluster health monitoring")

    # Run interactive_walkthrough with simulated input via temp file
    # (avoids subshell that would lose DIFF_NEW_PKGS array)
    local temp_input
    temp_input=$(mktemp)
    printf '%s\n' "$sim_input" > "$temp_input"

    interactive_walkthrough \
        "$temp_catalog" \
        "$temp_excl" \
        "$fixture_dir/el-metapkg-deps.txt" \
        "$fixture_dir/deb-metapkg-deps.txt" \
        < "$temp_input" > /dev/null 2>&1

    rm -f "$temp_input"

    local pass=0
    local fail=0

    # Verify output is valid JSON
    if jq empty "$temp_catalog" 2>/dev/null; then
        ((pass += 1))
    else
        echo "  FAIL: catalog is not valid JSON after write"
        ((fail += 1))
    fi

    # Verify catalog has more packages than original
    local new_count
    new_count=$(jq '[.categories[].packages[]] | length' "$temp_catalog")
    if [[ "$new_count" -gt "$orig_count" ]]; then
        ((pass += 1))
    else
        echo "  FAIL: expected more packages than original ($orig_count), got $new_count"
        ((fail += 1))
    fi

    # Clean up temp files
    rm -f "$temp_catalog" "$temp_excl"

    if [[ $fail -eq 0 ]]; then
        echo "[PASS] Catalog write: valid JSON, $new_count packages (was $orig_count)"
        return 0
    else
        echo "[FAIL] Catalog write ($pass pass, $fail fail)"
        return 1
    fi
}

# ── Main entry point ────────────────────────────────────────────────

if [[ "$SELF_TEST" == true ]]; then
    echo "Running self-tests..."
    echo ""
    failures=0
    test_exclusion_matching || ((failures += 1))
    test_pg_version_detection || ((failures += 1))
    test_diff_engine || ((failures += 1))
    test_metapkg_parsing || ((failures += 1))
    test_catalog_write || ((failures += 1))
    # Additional tests added in later tasks
    echo ""
    if [[ $failures -eq 0 ]]; then
        echo "All checks passed."
    else
        echo "$failures check(s) failed."
        exit 1
    fi
    exit 0
fi

# ── Normal mode: Docker discovery ───────────────────────────────────

check_docker
mkdir -p "$OUTPUT_DIR"

el_pkg_file=""
deb_pkg_file=""
el_deps_file=""
deb_deps_file=""

if [[ "$DEB_ONLY" != true ]]; then
    discover_el "$OUTPUT_DIR"
    el_pkg_file="$OUTPUT_DIR/rocky9-packages.txt"
    el_deps_file="$OUTPUT_DIR/rocky9-metapkg-deps.txt"
fi

if [[ "$EL_ONLY" != true ]]; then
    discover_deb "$OUTPUT_DIR"
    deb_pkg_file="$OUTPUT_DIR/debian12-packages.txt"
    deb_deps_file="$OUTPUT_DIR/debian12-metapkg-deps.txt"
fi

echo ""
run_diff "$CATALOG" "$el_pkg_file" "$deb_pkg_file" "$EXCLUSION_FILE"
print_diff_summary "$el_pkg_file" "$deb_pkg_file"

if [[ "$DISCOVER_ONLY" == true ]]; then
    exit 0
fi

# Print meta-package contents
# DEB deps are the authoritative source — EL meta-packages only chain
# to pgedge-postgresql18-server and don't list component packages.
echo ""
echo "=== META-PACKAGE CONTENTS ==="
deps_file=""
if [[ -f "$deb_deps_file" ]]; then
    deps_file="$deb_deps_file"
elif [[ -f "$el_deps_file" ]]; then
    deps_file="$el_deps_file"
fi
if [[ -n "$deps_file" ]]; then
    parse_metapkg_deps "$deps_file"
    echo "pgedge-enterprise-all-18 includes:"
    printf '  %s\n' "${METAPKG_FULL[@]}"
    echo ""
    echo "pgedge-enterprise-postgres-18 includes:"
    printf '  %s\n' "${METAPKG_MINIMAL[@]}"
fi

interactive_walkthrough "$CATALOG" "$EXCLUSION_FILE" "$deps_file" "$deps_file"
