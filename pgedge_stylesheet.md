# Documentation

Document files should be named in the form my_file.md, and docs for each project should live in the `docs` folder (or sub-directories of the `docs` folder).

The following product names are proper nouns and should be treated as such.  As a rule you should generally omit 'the' in front of the name unless using the name as an adjective to describe software, files, or other project artifacts:

pgEdge Cloud
pgEdge Enterprise Postgres
pgEdge Distributed Postgres
Enterprise Postgres
Distributed Postgres
pgEdge Postgres
pgEdge AI Toolkit
Spock
LOLOR (aka lolor)
ACE
pgEdge Vectorizer
Snowflake
pgEdge Postgres MCP Server
pgEdge Anonymizer
pgEdge RAG Server
pgEdge Docloader

Exceptions are:

the Control Plane

Lines in each .md file should be as long as possible, while wrapping content at 79 characters. Hyperlinks and table columns should not be split by wrapping.

Replace em-dashes with regular dashes (hyphens).

Remove bold highlighted text content - it is identified as a heading level by some software. 

Each public repo/project should have a folder named docs that contains source documentation files in simple markdown format. Files in the doc folder are referenced by the TOC (at the top of the README file) and the mkdocs.yaml file used to build the pgEdge documentation suite.

The LICENSE.md file should be stored inside the docs folder; aliases from other folders don't work properly with MkDocs.


## Formatting a README File

Every public repo should have a README file.  The top of each README should include:

* a first-level heading (#) identifying the project by name (# Project Name).
* if applicable, links to regression testing tools or developer/dba tools
* Github Action badges for important actions in use by the repository.

The heading info noted above should be followed by a Table of Contents (TOC) heading and links that build the TOC with the contents of the docs folder:

* A second-level heading (## Table of Contents)

That heading is followed by a bulleted list of linked content that resides in the docs folder. If possible, use a gerund in section titles and headings; the following sections are exceptions to this rule.

* Architecture
* Overview
* Getting Started
* Release Notes
* FAQ
* Developer Resources
* Reference sections

Top level entries in the TOC should mirror the mkdocs.yaml file nav panel list for the project, and link to the same .md file used in our online documentation (docs/file_name.md); second-level links in the hierarchy may refer to content within a .md file (docs/file_name/#section_name):

* Architecture Guide
* Best Practices Guide
* Getting Started/Quick Start
* Building the Project
    * Should include prerequisite steps
* Installing the Project
* Configuring the Project
    * Advanced Configuration
* Using the Project
* Upgrading the Project Installation
* Managing an Installation
* Modifying a Deployed Project
* Monitoring/Logging
* Performance 
* Function Reference - usually a page of links to the individual pages
    * Individual Function Reference pages 
* API Reference
* Troubleshooting
* FAQ
* Release Notes
* Developer Resources

After the TOC, include a short introduction that describes the project, including what the project 
does, and a very short descriptions of usage or why someone might use the project.  After the
introductory paragraph, and include the following sections:

The ## Installation section has an introductory sentence, followed by:

* Prerequisite software or configuration details
* How to installing the project with pgEdge software like the Control Plane if applicable.
* How to building from source.

Next is the ## Configuration section; this section has an introductory sentence, followed by:

* simple configuration steps.
* a link to more advanced installation options.

Next is the ## Using Project Name section; this section has an introductory sentence, followed by:

* simple usage instructions and examples.
* one or more links to more advanced usage pages.

Next is the ## Documentation section; this section has an introductory sentence, followed by:

* details about building the documentation from source.
* links to the pgEdge documentation site.

At the end of the README:

Include a ## Support & Resources section that contains:

* links to help and documentation: "For more information, visit here."
* a link to the Issues page for the project:  "To report an issue with the software, visit: followed by helpful links"

If applicable, include a ## Contributing section for Developers/Project contributers that links to developer documentation or the GitHub site: "We welcome your project contributions; for more information, see docs/developers.md."

Include a link to the online documentation at:  For more information, visit [docs.pgedge.com](docs.pgedge.com)

At the end of each README file, include a ## License section that contains: 

This project is licensed under the [PostgreSQL License](LICENSE.md).


## Formatting the Content Files

The Table of Contents that appears in the left-hand navigation pane for our documentation project is defined in the mkdocs.yaml file for the given project or in the pgedge-docs repo (selected projects only). mkdocs.yaml resides in the project's root directory, alongside the docs folder for that project. The mkdocs.yaml file that organizes the navigation pane is in the same repo as the documentation files for that project. 

The mkdocs.yaml navigation content will be unique for each project, but will likely mirror the content in the TOC in the README file, and may include:

- Architecture Guide
    - Best Practices Guide
- Installing this Project
    - Getting Started/Quick Start
    - Building the Project
        - Prerequisites
    - Installation
    - Configuring this Project
        - Advanced Configuration
    - Upgrading the Project
- Using the Project
    - Connecting to the Project
    - Project Usage Instructions
- Using Project Management Features
    - Modifying the Installation
    - Monitoring/Logging
    - Performance
- Function Reference
- API Reference
- Troubleshooting
- FAQ
- Release Notes
- Developer Resources

Nested details can be in the same file as the steps to which it applies; for example, the Prerequisites section can reside in the same file as Building the Project/Installation.


## Within a .md File - Formatting Content

Each file should have one first level heading, and multiple second level headings.  Third and fourth level headings should be used for prominent content below the hierarchically-previous heading level. 

Each heading should be followed by an introductory sentence or paragraph that explains what will be discussed in the following section. This applies to all heading levels - # Top-level Headings, ## Section Headings, and ### Sub-section Headings.

Lines in each .md file should be as long as possible, while wrapping content at 79 characters. Hyperlinks and table columns should not be split by wrapping.

DO NOT:

* Use bold font within headings or text content - it is sometimes misinterpreted by MkDocs as a heading and added to the navigation pane.
* Use Hashtags in front of a step in a stepped list - it adds every step with a # in the step to the navigation pane in the upper-right side of the documentation page.
* Use fragments in bulleted or stepped lists: **Semantic matching:** uses pgvector for similarity-based cache lookups   
Do not refer to an object as 'it' unless the object 'it' refers to is in the same sentence. It is too ambiguous!

INSTEAD:

* Use full and grammatically correct sentences that are between 7 and 20 words long.
* Write in active voice.
* Use a semi-colon to link similar ideas or sentences with leading content.
* Use articles (a, an, and the) when appropriate.

If the page has a `Features` or `Overview` section following the introductory paragraph, the section should not start with a heading; instead use a sentence in the form:  "The MCP Server includes the following features:", followed by a bulleted list of the features.  

When formatting a bulleted list:

### Formatting Bulleted Lists

- Bulleted lists should complete sentences ending with periods.
- Each bullet item must start with a lowercase letter (unless starting with a proper noun or code element).
- Use a lead-in sentence before the list that ends with a colon.
- The lead-in sentence and bullet items together should form grammatically complete sentences.
- Keep lead-in sentences concise by using "include:" or "is useful for:" rather than verbose phrases like "include the following operations:" or "is useful for the following purposes:".
- When bullet items are gerunds (verb forms ending in -ing), they should work grammatically with the lead-in sentence.

For example, the following bulleted list is correct:

    The view includes:

    - the total entries and expired entries.
    - the total cache size in megabytes.
    - the average access count per entry.

The following bulleted list is not correctly formatted:

    The view includes the following metrics:

    - The view shows the total entries and expired entries.
    - The view shows the total cache size in megabytes.
    - The view shows the average access count.


### Formatting code:

If a section contains code or a code snippet, there should be an explanatory sentence before the code in the form: In the following example, the command_name command uses a column named my_column to accomplish description-of-what-the-code-does.

* Use a single quote around a single command or line of code:  `SELECT * FROM my code;`
* Use block quotes around multi-line code samples and include the code type in the format tag; for example:

    ```sql
    SELECT * FROM code;
    SELECT * FROM code;
    SELECT * FROM code;
    ```
* `stdio`, `stdin`, `stdout`, and `stderr` should be in courier (enclosed in backticks).
* Capitalize command keywords and use lowercase for variables.
* Include links to third-party software installation/documentation pages where used.
* Include links to our Github repo when we refer to cloning the repo, or working on the project.
* Do not create links to github.io.

### Formatting a numbered list:

A numbered list should always be made up of steps that must be performed in the order listed.  If the steps can be performed in any order, they belong in a bulleted list.  Before each numbered list, use an introductory sentence; then:

* leave a blank line before the first item.
* each entry in a numbered list should introduce the step with a complete and correct sentence.
* if a step involves code, that code should be properly indented and formatted (as noted above).
* do not use bold font when writing numbered lists.

### Formatting a table:

* All tables must have an introductory sentence immediately before the table. Use the pattern: "The following table [describes/shows/compares] X:".
* The introductory sentence should be active voice and explain what the table contains
* No Icons or Emojis in Tables.  Remove all emoji and icon characters (⚡, ✓, 💾, etc.) from table cells and replace with descriptive text (Fast, Good, High, etc.) or text descriptions.
* Keep table content professional and accessible.
* Tables should use plain text only.
* Tables should not use bold font in cells.
* Avoid special characters that may not render correctly in all formats.
* Use words rather than symbols to convey meaning.


## Troubleshooting Sections

Troubleshooting and problem solving sections should be added to a separate Troubleshooting section, rather than included in a section at the end of multiple doc files.  The Troubleshooting section should be sorted, and have sub-sections for topics like:

* connection issues
* authentication issues
* API-related issues
etc.

### Next Steps Sections

Include a "Next Steps" section at the end of tutorial and conceptual guide documents.

* The section should use H2 heading (## Next Steps).
* Provide 2-4 bulleted links to related documentation.
* Each bullet should be a complete sentence describing what the linked document covers.
* Use the pattern: "- The Document Name document describes/explains/provides X.".
* Do NOT include "Next Steps" in reference documentation, API docs, FAQs, or troubleshooting guides.
* For FAQ and troubleshooting documents, use a support/contact section instead (e.g., "Still Have Questions?")



