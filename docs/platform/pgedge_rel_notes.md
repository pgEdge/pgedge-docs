# pgEdge Distributed Postgres (VM Edition) Release Notes

## v25.3.0 on 2025-10-22

  - Added support for Spock 5.0.4; for release details, see the [release notes](https://github.com/pgEdge/spock/blob/main/docs/spock_release_notes.md).
  - Added support for [lolor 1.2.1](https://github.com/pgEdge/lolor/blob/main/README.md).
  
  ACE:

  - Fixed bug in scheduler for [ACE for the CLI](https://docs.pgedge.com/platform/ace).

## v25.2.1 on 2025-08-28

  - Added support for Spock 5.0.1:

    - Fixes a bug where updating a row that was inserted in the same transaction may use an incorrect timestamp for the inserted row and treat it as being newer than the update, resulting in the update not getting applied on other nodes.

  - Adds a check which prevents upgrading to spock 5 if `spock.enable_ddl_replication` is `enabled`.
  - Resolved an issue where upgrade compatibility checks would not fire when using `./pgedge install`.
  - Updated ACE to provide meaningful error messages if tables are empty during table-diff or Merkle tree operations.

## v25.2.0 on 2025-08-20

  - pgEdge Platform now supports Spock version 5.0; this is the default version.  

    - For details of Spock 5 improvements and new features, see the [Spock 5 release notes]().
    - For detailed information about upgrading to Spock 5, see [the documentation](../platform/installing_pgedge/upgrade_spock.md).

  - PostgreSQL 17 is now the default major version.
  - The CLI now supports the latest PostgreSQL minor versions: 17.6, 16.10 and 15.14
  - Platform 25.2 now includes Software Bill of Materials (SBOMs) for all distributed components, enhancing transparency, compliance, and security auditing.
  - Migrated install/package repository to `downloads.pgedge.com`.

  ACE:

  - Merkle tree operations now honor the Postgres server's configured isolation level (instead of forcing repeatable read).
  - Improved data type handling in diff report generation.

  Bug Fixes:
  
  - Setting a custom `data` directory during setup now properly supports directories with spaces in the name.
  - The `json-create` and `json-validate` commands now allow hostnames in cluster configurations. 
  - The pgBackRest module no longer defaults `pg1-host` to 127.0.0.1, ensuring it detects localhost properly.
  - `./pgedge db guc-set` now properly supports quoted parameters.
  - Fixed an issue where LD_LIBRARY_PATH needed to be set when invoking pgBackRest directory.
  - Released new package versions for various components.
  - Updated CLI Python dependency packages


## v25.2.1 on 2025-08-28

  - Added support for spock 5.0.1:

    - Fixes a bug where updating a row that was inserted in the same transaction may use an incorrect timestamp for the inserted row and treat it as being newer than the update, resulting in the update not getting applied on other nodes.

  - Adds a check which prevents upgrading to spock 5 if `spock.enable_ddl_replication` is `enabled`.
  - Resolved an issue where upgrade compatibility checks would not fire when using `./pgedge install`.
  - Updated ACE to provide meaningful error messages if tables are empty during table-diff or Merkle tree operations.

## v25.2.0 on 2025-08-20

  - pgEdge Platform now supports Spock version 5.0; this is the default version.  

    - For details of Spock 5 improvements and new features, see the [Spock 5 release notes](https://github.com/pgEdge/spock/blob/main/docs/spock_release_notes.md).
    - For detailed information about upgrading to Spock 5, see [the documentation](../platform/installing_pgedge/upgrade_spock.md).

  - PostgreSQL 17 is now the default major version.
  - The CLI now supports the latest PostgreSQL minor versions: 17.6, 16.10 and 15.14
  - Platform 25.2 now includes Software Bill of Materials (SBOMs) for all distributed components, enhancing transparency, compliance, and security auditing.
  - Migrated install/package repository to `downloads.pgedge.com`.

  ACE:

  - Merkle tree operations now honor the Postgres server's configured isolation level (instead of forcing repeatable read).
  - Improved data type handling in diff report generation.

  Bug Fixes:
  
  - Setting a custom `data` directory during setup now properly supports directories with spaces in the name.
  - The `json-create` and `json-validate` commands now allow hostnames in cluster configurations. 
  - The pgBackRest module no longer defaults `pg1-host` to 127.0.0.1, ensuring it detects localhost properly.
  - `./pgedge db guc-set` now properly supports quoted parameters.
  - Fixed an issue where LD_LIBRARY_PATH needed to be set when invoking pgBackRest directory.
  - Released new package versions for various components.
  - Updated CLI Python dependency packages


## v25.1.0 on 2025-07-09

  - You can now use the `pg_data` flag with the [setup](../platform/pgedge_commands/setup.md) command and in your [cluster.json](../platform/installing_pgedge/json.md) file to specify a non-default location for your Postgres `data` directory.

  - ACE functionality now includes experimental support for Merkle trees. This feature significantly enhances the performance of ACE on large tables.

## v25.0.0 on 2025-06-04
 CLI

  - Introduction of the [json-create command](../platform/installing_pgedge/json.md) to simplify configuring a standard cluster with Spock, ACE, and pgBackRest deployed and replicating. This command invokes [a script](../platform/installing_pgedge/json.md#creating-a-cluster-configuration-file) that prompts you for input about your cluster.
 
  - Enhanced behavior of the cluster module's add-node command. If the source node is configured to use pgBackRest, add-node will use the configured repository from the source node for the target node.  pgBackRest configuration options specified in the target node JSON file are configured on the target node after the add-node process completes.  If a valid backup exists in the source node’s configured pgBackRest repository, the backup will be used for the add-node operation rather than creating a new backup. 
 
  - Improvements to the `cluster` module `json-validate` function that allow you to validate additional configuration details, populate default values when not present, and support updating the cluster JSON configuration in place.
 
  - Addition of the `cluster app-concurrent-index` function; the function allows you to create concurrent indexes on all of the nodes in a cluster when AutoDDL is enabled.
 
  - Improvements to `cluster remove-node`; clusters with multiple databases will now properly manage subscriptions and node clean up in each database.
 
  - Enhanced AutoDDL behavior; if AutoDDL is enabled in the cluster configuration, AutoDDL will only be set to `on` for the first database during cluster setup.
  
ACE Improvements
  
  - ACE now supports scheduling automated `ace table-diff` and `ace repset-diff` operations.
  
  - ACE adds an auto-repair feature that allows you to schedule repairs for INSERT-INSERT conflicts.
  
  - ACE adds support for a SQL clause that allows you to run `ace table-diff` (with the `-t` or `--table-filter` option) on a subset of rows.
 
  - ACE now (optionally) returns colorized diff reports in HTML format (with the `-o` or `--output-html` option).

  - ACE adds support for client-cert based authentication for ACE modules.

  - ACE improves the behavior of `ace schema-diff` for both tables and objects.

  - ACE adds support for the  `--insert-only` and `--bidirectional` options to `ace table-repair`.

Bug Fixes

  - Fixes an issue where selinux configuration could prevent enabling AutoDDL in the spock configuration for a node when using the cluster module.

  - Fixes an issue where Postgres might not be correctly stopped when using the cluster remove command.

  - Fixes an issue where PostGIS fails to install on certain amd64-based systems.

  - Fixes an issue where the `pgedge setup` command removed a non-empty data directory while creating a sym link for /data.  The contents of the data directory will now be moved to /data before the sym link is created.

## v24.10.13 on 2025-05-09
  CLI
  - Support for PostgreSQL minor versions 17.5, 16.9, and 15.13

## v24.10.12 on 2025-03-15
  CLI 
  - Updated packaging to correct PostGIS 3.5.0 dependency issue

## v24.10.11 on 2025-03-05
  CLI  
  - Fixed upgrades to Postgres minor versions via the CLI.
  
  Spock 4.0.10   
  - Fixed error loop caused by multiple exceptions that could cause subscriptions to become disabled.
  
  Support for the latest Postgres minor versions:  
  - 17.4, 16.8, 15.12
  
  An Offline tarball is available for version 24.10.11 that bundles the above fixes.

## v24.10.7 on 2024-11-25
  CLI 
  - Support for Postgres versions 17.2, 16.6, and 15.10.
  - Support for pgVector version 0.8.0.
  Spock 4.0.6-1
  - Adding sub_disable exception behavior. 

## v24.10.2 on 2024-10-02
  CLI
  - Continued standardization of input flags.
  - Improvements to guardrails on cluster init and add node commands.
  - Removes hard coded spock version in json-template.
  - Support for PG17 extensions.
  Spock 4.05
  - Fixed support for column filters.
  - Fixes to auto ddl and exception logging.
  
## v24.08.8 on 2024-08-28
  CLI
  - Ace fixes, including support for multiple databases and data types.
  - Improvements to add node and remove node commands.
  - Added support for setuser and permissions extensions.
  - Updates to RPM packaging.
  Spock 3.3.6-1
  - Improvements to Auto DDL functionality.
  Spock 4.0.1-1
  - Enhanced Auto DDL support, including fixes for prepared statements, partition primary key replication sets, and table creation via EXPLAIN.
  - Addressed limitations related to non-superuser operations.
  - Updates to the upgrade script.
  - Adding the repair mode function and exception table handling.
  Lolor 1.2-1
  - Fixed issues with shared preload libraries.
  Snowflake 2.2-1
  - Resolved issues with the Snowflake conversion function.
  - Added upgrade support.


## v24.3.3 on 2024-03-26
  - fix to ACE to use first of possibly mulitple db's (CP #)
  - doc fix for localhost (CP #)


## v24.4.0 on 2024-03-21
  Spock v4.0dev4
  - logical clock
  - unique 16-bit generated node id's
  - repair mode for transactions

## v24.3.2 on 2024-03-17
  - fix 'update' command to work from CLI v24.1.3 & forward
  - Large Object LOgical Replication: lolor v1.0dev1
  - spock v4.0dev3 (evolved from v3.3dev2)
  - default spock 32 --> 33
  - spock v3.3.1 support (evolved from v3.2.8)
  - OSX arm64 experimental support for localhost dev/test
  - more backup/restore/pitr integration via backrest v2.50-3 
  - 'localhost' commands split out from 'cluster'
  - improvements to 'cluster' usability (cady)
  - 'db', 'cluster', 'spock', &'vm' doc cleanups (cady)
     
## v24.3.1 on 2024-03-07
  - update 'spock32' to v3.2.8 on pg14/15/16
     + fix problem with pg14 build
     + do not backup snowflake schema when sync_structure
     + restrict CREATE|ALTER|DROP SUBSCRIPTION command
     + allow CLUSTER command
     + only allow top level statements to replicate
  - update 'readonly' to 1.2 on pg14/15/16
  - update 'postgis' to 3.2.4 on pg15/16
  - update 'vector' to 0.6.1 on pg15/16
  - update 'spock33' to v3.2dev2 on el8/el9/arm9 for pg15/16
  - fix messaging & setup issues

## v24.2.5 on 2024-03-01 
  - spock v3.3dev1 for pg15 & pg16
  - New '-3' binaries for pg15.6 & pg16.2 for spock33 compatibility
  - configurable extension meta data (1st step toward disabled extensions at setup time)
  - VM CLI now supports AWS plus 
  - MULTICLOUD CLI now referred to as VM (virtual machine) CLI
  - rename cluster 'local-create' command to 'localhost-create'
  - rename cluster 'local-destroy' command to 'localhost-destroy'
  - stop using deprecated './pgedge install pgegde' command, in 'cluster localhost-create',
      in favor of using './pgedge setup' command
  - experimental developer support for pg15 on OSX

## v24.2.4 on 2024-02-23 
  - spock v3.2.7 is available as default in pg15 & pg16
  - improve and document regressions tests (susan)
  - fix 'update' command to install/re-install ctlibs

## v24.2.3 on 2024-02-21 
  - make spock v3.2.7rc1 available for test
  - 'multicloud' CLI support (for test clusters)
  - add test support for wal2json on pg15/16 
  - backrest v2.50-2 now support full, incremental and pitr(ibrar)
  - prelim support for pREST as a test component
  - add prelim support for our pgedge patroni v3.2.1
  - 'install patroni' now pulls in 'etcd' as a dependency
  - bump etcd to 3.5.12
  - 'install etcd' now also install golang & haproxy by default
  - remove staz 
  - deprecate postgREST

## v24.2.2 on 2024-02-14 
  - add plv8 support for pg16 on el9 & arm9
  - fix deprecation warnings where still using 'nc' instead of 'pgedge'
  - 'setup pgedge' fully supports using flags syntax & pinning pg &/or spock versions
  - deprecation warning for 'install pgegdge'
  - fix ACE success messages in util.py (Cady)
  - ignore --help description lines starting with ('Type: ' & 'Default: ')


## v24.2.1 on 2024-02-12 
  - bump spock32 to v3.2.6 with auto-dll fixes and regression fixes
  - bump pg16 to v16.2-2 (now includes patch with new delta apply functionality to be used in spock33)
  - fixes to avoid duplicate logging (Cady)
  - fix db create when spock already on the cluster (multiple db's)
  - fix bug installing specific component versions where metadata updates & config not run
  - getting ready for spock33 private beta (default spock now explicitely 32 now that there is more than one)
  - display deprecation warning when 'nc', 'nodectl' or 'ctl' aliases used for 'pgedge' CLI name
  - passing '--no-tty' to any CLI forces non-interactive mode (most are non-interactive anyway)
  - bump postgrest from 11.2.0 to 12.0.2 (& also remove dependency on deprecated component.py)
  - bump backrest from 2.49 to 2.50
  - bump orafce from 4.5.0 to 4.9.2


## v24.1.9 on 2024-02-07 
  - build spock-3.2.5rc1 el9 test version for auto_ddl
  - enhance ACE with functionality to handle row offset mismatches ( PR #86 Tej)
  - bump pg minor versions to 16.2, 15.11, .....
  - more refactoring for service commands and logging (PR #85 Cady)
  - fix regression in 'service.py' including 'component' that was removed
  - 3rd pass at 'setup pgedge' as documented way to install pgedge AND 
     be able to pin the spock version


## v24.1.8 on 2024-02-06 
  - build spock-3.2.5beta2 el9 test version  for auto_ddl
    + Add tables with PK to default repset, while removing it from insert_only (if added there)
    + synchronize tables
    + Added INFO/LOG messages.
  - regession fix and more refactoring for um, service and logging (PR #84 Cady)
  - many more regression test improvements (PR #83... QA)
  - start work on new 'setup pgedge' with online help
  - remove unused 'Id' parm from db.create()
  - specifying '-p port' parm for 'install pgedge' is enforced
  - deprecate docker folder in favor of pgedge-docker repo
  - remove unused .py files & use -upstream/install.py by default


## v24.1.7 on 2024-01-31 
  - build spock-3.2.5beta1 el9 test version for wip_auto_ddl functional testing
  - add util.run_native() for supporting backrest, patroni, ansible and etcd CLI's
  - bump pgvector from 0.5.1 to [0.6.0](https://github.com/pgvector/pgvector/blob/master/CHANGELOG.md)
  - improve [DB doc](https://github.com/pgEdge/cli/blob/REL24_1/cli/DB-README.md)
  - improve [ACE doc](https://github.com/pgEdge/cli/blob/REL24_1/cli/ACE-README.md) 
  - cleanout nclibs, ddlx, & multicorn2 from versions.sql (not supported yet)
  

## v24.1.6 on 2024-01-30 
  - work on build automation
  - lots of work updating doc
  - a cleaned up, simplified and documented CLI 'devel/setup' process
  - drop the '24' in versions24.sql & install24.py
  - fold in the multicloud POC from multicloud-cli project
  - use newer 'PyYAML', add 'ansible', drop 'supervisor' in 'ctlibs'
  - deprecate 'ctl' for 'pgedge' as CLI name
  - ACE fixes for json config changes (PR #81 Tej)
  - More UM refactoring (PR #79 & #80 Cady)
  - 'ent' modules are now simply marked 'prod'
  - rename 'secure' module to 'cloud'
  - seperate out 'pgbin-build' from 'nodectl' & rename it to 'cli'
  - lots of new doc & unit testings (PR #71, 73, 74 - Hayee)
  - refactor of UM and SERVICE (Cady)
  - eliminate bzip2 requirements in favor of standard gzip and optionally pigz 
  - bump pg_curl from 2.1.1 to 2.2.2
  - improve build automation across platforms
  - bump timescaledb from 2.11.2 to 2.13.1
  - add pg16 support for timescaledb
  - bump plv8 from 3.2.0 to 3.2.1
  - bump partman from 4.7.4 to 5.0.1
  - bump postgis from 3.4.0 to 3.4.1
  - bump citus from 12.1.0 to 12.1.1
  - add support for multiple spock db's (PR #70 Cady)
  - add support to ACE for repset-diff (PR #72 Tej)
  - fix two things for SLES & OpenSuse LEAP support
    + remove ruff.toml broken link at runtime from hub/scripts
    + make sure we properly support SLES 15 & not just OpenSuse LEAP 15
  - quite down install ctlibs for ubu22, al2023 & LEAP/sle15
  - start using .tgz files in REPO to elimnate need for BZIP2 to be installed 


## v24.1.5 on 2024-01-08 
  - bump spock32 to v3.2.4 & remove spock31 support
  - bring back el9 version of pg17, snowflake-pg17 & spock32-pg17
  - bring skeleton.sh tests up to snuff for pg14/15/16 & el8 consideration
  - foslots and readonly for pg14/15/16 & el8
  - bump pgadmin4 to 8.x
  - bump etcd to 3.5.11 & include for el8
  - bump backrest to 2.49 & include for el8
  - include el8 builds for pgcat, etcd & backrest
  - developer builds of pg14 thru pg17 all include log_old_values patch
  - verify SELinux not active when trying to --autostart a 'pgedge install'
  - fix error handling on file priv's in cli.py
  - improve pg14 with spock32 patches
  - 1st pass at replacing 'cloud' w/ 'multicloud'


## v24.1.4 on 2024-01-02 
  + CLUSTER:
    - rework cluster-init json for compat with enterprise cloud

  + CLOUD:
    - leverage apache-libcloud module from pypy
    - rename machine.py --> cloud.py
    - patch libcloud with a fix from equinixmetal (metros) & from us (ram TB)
    - include our patched libcloud 3.8.0 in our lib directory (& remove from requirements.txt)

  + EL8/SLE-15 for AMD64:
    - require python39 be added so we can use it over the default (unsupported) python36
    - support spock & snowflake for EL8 on am64 for pg 14/15/16
    - test on Rocky Linux 8 & Open Suse LEAP 15.5

  + CTL:
    - fix security warning when using tar.extract_all() by using data_filter when available
    - v 23.x is no more.  v24.x is always used & install.py is a symlink to install24.py
    - drop support for pg17devel (replace with spock3x & wait for 17beta1)
    - use ruff (rather than flake8 & black)

  + DOCKER:
    - use latest RockyLinux 9 image (rather than 9.2)
    - drop fakectl notes at bottom of README


## v24.1.3 on 2023-12-05 
  + CTL:
    - fix nc & nodectl regression when called from a different directory


## v24.1.2 on 2023-12-04 
  + CTL:
    - comment out nc & nodectl deprecation warning (for now)

  + PG14:
    - snowflake now supports pg14
    - 'install pgedge --pg 14' now supported

  + ACE:
    - fixes and improvements to table-repair

  + SPOCK32: 
    - v3.2.2 regression fix for missing transactions in corner cases


## v24.1.1 on 2023-11-30 
  + PGEDGE:
    - 'install pgedge' now defaults to spock32 for pg14, pg15 & pg16

  + ACE:
    - table-repair can now handle missing, divergent and extra rows

  + SPOCK32: 
    - support for pg14 on EL9
    - support for limited feature set against core/unpatched pg14+
    - 3.2.1 on pg14, pg15, pg16 & pg17
    - pg14 version is compiled against unpatched postgresql

  + PG14:
    - now available on EL9 
    - still on EL8 too

  + BACKREST:
    - support pg14/15/16
    - upgrade to 2.48

  + CTL: 'nc' & 'nodectl' are now aliases for 'ctl'

  + DEV/TEST:
    - test on Fedora Core 39 w Python 3.12
    - test on Ubuntu 23.10 w Python 3.11
    - test on Amazon Linux 2023
    - code cleanups:
      + use 'black' coding style consistently
      + use 'flake8' incrementally
    - exclude use of urlllib3 v1.26.18 (does not work on OSX)


## v24.0.10 on 2023-11-17
  + small fixes for Fedora 39 & python 3.12 test support
  + regenerate and cleanup doc
  + document regression tests using cluster local-create, northwind, & ace
  + MACHINE: doc & more improvements


## 24.0.8 on 2023-11-15
  + SPOCK32: bump to 3.2dev7 for prelim paralell_slots testing on pg17


## 24.0.7 on 2023-11-13
  + ACE: table re-run only compares delta rows
  + MACHINE: 3rd pass includes:
    - equinixmetal fixes to LibCloud 3.1.8+ for size_list() & node_create()
    - size_list(), node_list(), node_start(), node_stop(), node_reboot(), node_create()
  + CITUS: bump to 12.1 and make available for pg16 
  + PLDEBUGGER: bump to 1.6 and make available for pg16
  + ANSIBLE: add native command line support
  + SPOCK32: bump to 3.2dev6 for pg14 support & can compile against unpatched postgres

  Fixes and minor changes:
  + fix get/set guc (cady)
  + complex und apps only supported on EL9
  + add error message when './nc list' is empty
  + filter out pre_reqs on './nc list'
  + bump pg12/13/14/15 on el8-amd architecture to latest releases
  + bump pglogical (for test only) to 2.4.4 for pg15 & now also pg16
  + bump cron to 1.6.2 for pg15 & pg16


## 24.0.6 on 2023-11-07
  + bump pg15 & pg16 to latests from community
  + refactor to be able to run PyCharm IDE/debugger on cli.py
  + rework container strategy to lose dependency on systemctl
  + refactor install pgadmin4 web to support el9, httpd & configuring firewalld
  + another pass at OSX support for dev
  + 1st pass at creating multicloud clusters leveraging new MACHINE & FIREWALL CLI's  


## 24.0.5 on 2023-11-01 
  New Features:
  + MACHINE: 2nd pass includes support for basic AWS & EQNX functionality
  + FIREWALL: new support for firewalld configuration
  + Support for PyCharm IDE for making development easier

  Fixes and minor enhancements:
  + cleanup requirements.txt
  + 1st pass at --ent components
  + refactor --extension, --showduplicates & --test
  * bump readonly to 1.1.1, vector to 1.1.1, & spock31 to 3.1.8
  + 'CREATE EXTENSION snowflake' after install --no-restart (pgedge-2-07)
  + better messaging for unsupported pg binaries on a platform
  + fix './nc update' when in the 24.xxx stream
  + better instrument 'reload pgXX' when running w/ or wo/ systemd

## 24.0.4 on 2023-10-24

  Fixes and minor enhancements:
  + deployment problems caused by cady and ibrar and tej.  :-)
  + fixes to se3cure.py (cady)
  + default 'install pgedge' to '--pg 17' (denis)
  + default INSTALL_PY to 'install24.py' if "-upstream" is in REPO (denis)

## 24.0.3 on 2023-10-23
  New Features:
  + MACHINE: 2nd pass includes support for configuring remote firewalls

  Fixes and minor enhancements:
  + added the '--pause' option to 'install pgegde'

## 24.0.2 on 2023-10-21
  + SNOWFLAKE: New extension to support snowflake sequences (jan)
  + SPOCK: 3.2dev5 readonly(asifr/affan) & snowflake migration (jan)
  + PG: Hidden Columns patch (korry)
  + STAZ: Spock Three AZ Clustering (ibrar)
  + ACE: new upsert & dryrun functionality (tej)
  + DB: 1st pass @ get & set GUC functions (cady)
  + MACHINE: 1st pass at experimental cli (denis)

  Minor fixes and supporting enhancements:
  - refactor pg build process to cleanly apply N patches (denis)
  - support INSTALL_PY env for cluster commands using install24.py
  - bump pg15/16/17 to include HiddenColumns patch (denis)
  - enhance 'install pgedge' for STAZ (denis)
     + add 'replicator' role
     + support optional '--rm-data' parm
  - update pgcat, etcd, & staz from 'test' to 'prod' status (denis)
  - update copyright notices for 2024 (denis)
  - move unused nt.py and repo.py scripts to attic (denis)
  - 1st pass at instructions for settting up virtual env (denis)
  - refactor for easier debugging (denis)


## 24.0.1 on 2023-10-17
  - begin dev for 2024 Edition
  - bump spock to 3.2dev3 and add support for pg15-pg17
  - add support for snowflake 1.1 to pg15-pg17
  - install snowflake in pgedge2-6


## 23.129 on 2023-09-14
  - leverage lbzip2, if present, to dramatically speed installation
  - improve Dockerfile.el9 to install lbzip2
  - bump Spock to 3.1.6 GA
  - bump pg16 to 16.0 for GA
  - bump oraclefdw 2.6.0 and add support for pg16
  - bump partman to 4.7.4 and add support for pg16
  - continuous improvements in quality & quantity of test scripts (thank u Susan and team)
  - fix northwind schema and data to use numeric(9,2) for prices & double for discount (was using real)
  - add support to pg16 for pgCron & pgAudit
  - bump plprofiler to 4.2.4 and support pg15 & pg16
  - bump pgVector, PostGIS, TimescaleDB, & Orafce  to latest versions 
  - rename the cluster CLI local & remote commands for consistency
  - move the new Spock `db-create` command to `db create`
  - move new `pool` cli commands to `db pool-`
  - fix northwind demo to work with nodes that default to port 5432
  - start with first available port after 6432 for port1 in `cluster.create-local()`
  - improve `db-create` to return json & generate a password if not supplied


## 23.128 on 2023-08-29
  - bump pg16 to rc1 
  - Spock to 3.1.5 (with new security roles defined & diff2 backpatch to pg15)
  - improve efficiency of `ace diff-tables` to handle massive tables w blocks of checksums
  - bump pgcat to 1.1.1 & make available for dev and test
  - add support for plv8 3.2.0 for dev and test
  - fixed a tricky problem (reported by susan) when adding tables to a repset  w/ a wildcard (cady)
  - Fix missing static lib for uuid-ossp in pg15 & pg16 builds
  - 2nd pass at implementing `spock.db_create()` for supporting Dev Edition reqmnts 
  - WIP: refactor `install-pgedge.py` to use `spock.db_create()`
  - 2nd pass and document `secure` CLI (cady)
  - WIP: Windows compatibility for `secure` & `cluster` CLI commands


## 23.127 on 2023-08-10
  - add support for pg16beta3 & bumped versions of pg11 thru pg15
  - add `secure` api for interacting with pgEdge Cloud services
  - add `requests` & `awscli` as default nclibs
  - enhance northwind app to use schema 'northwind' rather than defaulting to 'public'
  - the basic `cluster.import_remote_def()` now works
  - `spock.repset_add_table()` only throws WARNING when table cannot be added
  - create a good dev baseline for etcd & patroni installs
  - create a good dev baseline for pgcat (throwing a `sed` error)
  - get devel scripts for start & stop http.server out of base directory & into devel 


## 23.126 on 2023-08-03
  - improve devel/setup doc & completeness
  - add support for `./nc psql 99 -f`
  - confirm `cluster app-install northwind` works fully
  - drop unused from `spock.py` `validate()`, `tune()` & `install()`}
  - fix regression in `spock.repset_add_tables()` for wildcards
  - soften bad_os warning
  - fix bug where `./nc tune` setting working_mem to 0 GB
  - `install pgedge` now supports parms `--with-patroni`, `--with-backrest` & `--with-cat`
  - bump backrest from 2.46 to 2.47
  - fix install/remove for backrest not to assume pg15
  - bump plv8 to 3.2.0


## 23.125 as of 2023-07-31
  - bump PostGIS to v3.3.4
  - add pgvector-0.4.4 as an extension for pg15 & pg16
  - bump PL/Profiler to 4.2.2 and add support for pg16
  - more adding support for northwind (just like pgbench) as a demo/test app
  - begin adding support for `cluster.import_remote_def()`
  - begin adding `util.wait_pg_ready()`
  - begin adding support for `pgbench_check`

## 23.124 as of 2023-07-21
  - fix upgrade to 23.124 to re-install nclibs
  - fix regression on supporting `ubu22-amd`
  - fix `spock.metrics_check()` slot name
  - add support for `ubu22-arm`

## 23.123 as of 2023-07-20
  - fix race condition when initializing cluster in Docker
  - improvements to autostarting PG for Docker
  - incremental improvements and fixes to `spock.py` (thank u cady)
  - remove speculative doc support for Amazon Linux 2023 (adding it back is "coming soon")
  - add 1st pass northwind as a demo/test app (alongside pgbench)
  - remove `runNC()` & `validate()` from `cluster.py`
  - improve `cluster.command()` to work with local and remote
  - improve lag monitoring & expose via `spock.metrics_check()`

## 23.122 on 2023-07-18
  - install platform specific `nclibs` and support running  on el9-amd, el9-arm, ubu22-amd & osx-amd/arm
  - bump Spock to 3.1.4 (bug fixes)
  - document `service init` & `service config` commands as internal use only
  - ensure `cluster create-local`:
       defaults to pg16, but allows for --pg=15 override
       allows for -U, -P and -d overrides from command line
  - fix race-condition in docker compose code
  - ensure `cluster remote-init` and `cluster create-local` commands are working in parity 
      & with shared codebase
  - get to codeComplete for `cluster remote-init`
  - get to codeComplete for `cluster remote-reset`
  - improve flexibility of `cluster.runNC()` to handle passwordless ssh without certificates
  - improve `cluster.echo_cmd()` to handle remote ssh when os_user is presented
  - verify `cluster.echo_cmd()` handles remote ssh when ssh_key is present

## 23.121 on 2023-06-30
  - fix regression to allow core PG functionality to use Python 3.6+ (not require Python 3.9+)
  - improve `ace diff-tables` error handling and re-factor for going fwd
  - make 1st and 2nd passes at `cluster remote-init`
  - bump orafce to v4.3.0
  - bump curl to v2.1.1

## 23.120 on 2023-06-29
  - bump pg16beta1 to pg16beta2
  - improve `ace diff-tables` to optionally use checksums
  - basic v1.0 of nodectl-mqtt available in dev\test mode
  - get latest pgCAT & postGREST and make work for arm9 and el9 in dev\test
  - bump pglogical to v2.4.3 (for testing only)
  - improve `info` layout whilst showing `cloud-init query` (if available)
  - improve `install.py` with an `update --silent` & `info` command at end

## 23.119 on 2023-06-23
  - fix Spock bug resulting from multiple updates in same transaction.
  - bump postgis to v3.3.3
  - scrub passwd from logs
  - fix a hanging regression when NOT in an EC2 kind of VM

## 23.118 on 2023-06-22
  - improve ssh support for `cluster create-local`
  - add devel/setup support for zookeeper & patroni
  - stub out starfleet support
  - add warning when not EL9+ or Ubuntu 22.04+
  - add cloud metadata to INFO command (region, az, instance_id, account_id, flavor)
  - new version of Spock 3.1.3 supporting double update bug fix and other.

## 23.117 on 2023-06-08
  - fix broken LLVM support in pg15.3-2 & pg16beta1-2
  - default `install pgedge` to pg16
  - improve support for docker-compose
  - these release notes
  - add support for hypopg-pg15/16
  - add support for timescaledb-pg15
  - add support for postgis-pg15
  - fix several error message typos (thank u Susan)
  - switch from using JDK11 to JDK17
  - wip `cluster create-local` use passwordless ssh on localhost


## 23.116 on 2023-05-20
  - `cluster create-local`
  - add support for pg16 beta1


## 23.115 on 2023-05-15
  - add support for pg16-dev3

