# Formatting README files

This section of the stylesheet applies to the README files in each of our public repos - every
public repo should have a README file.


At the top of each README file, links to the contents of the docs folder should create a
table of contents (TOC).  The top of each README file should contain:

* A first-level heading (# Project Name)
* If applicable, links to regression testing tools or developer/dba tools
* A second-level heading (## Table of Contents)

That heading is followed by a bulleted list of linked content that resides in the docs folder
that may include (where applicable for the project).  Each link in the list should be in a separate
.md file:

- Architecture Guide
- Best Practices Guide
- Getting Started/Quick Start
- Building the Project
    - Should include prerequisite steps
- Installing the Project
- Configuring the Project
    - Advanced Configuration
- Project Usage Instructions
- Upgrading the Project Installation
- Project Management Features
- Modifying a Deployed Project
- Monitoring/Logging
- Performance 
- Function Reference
- API Reference
- Troubleshooting
- FAQ
- Release Notes
- Developer Resources

---

After the TOC, a short introduction should describe the project; this can include what the project 
does, and very short descriptions of usage or who would benefit from using the project.  After the
introductory paragraph, include details about:

Building from Source
Simple Configuration Steps
Using the Project
Building the Documentation from Source

The intention of the README file is to include enough information to get a user started, along with
links to deeper information for a long-term user.

README file content should be wrapped at 79 characters, with the exception of links and table
cell content, which should all reside on the same line.

At the end of each README file, include a second-level heading (## License) followed
by the note:

This project is licensed under the [PostgreSQL License](LICENSE.md).

The LICENSE.md file should be stored in the docs folder; aliases don't work properly
with MkDocs.


## Documentation

The Table of Contents for our documentation project is defined in the mkdocs.yaml file for a 
project.  The mkdocs.yaml file resides in the same directory as the docs folder.  The file content
will be unique for each project, but will likely mirror the content in the TOC from the README file,
and may include:

- Architecture Guide
    - Best Practices Guide
- Installation
    - Getting Started/Quick Start
    - Building the Project
        - Prerequisites
    - Installing the Project
    - Configuring the Project
    - Advanced Configuration
- Using the Project
    - Connecting to the Project
    - Project Usage Instructions
    - Upgrading the Project Installation
- Project Management Features
    - Modifying the Installation
    - Monitoring/Logging
    - Performance 
- Function Reference
- API Reference
- Troubleshooting
- FAQ
- Release Notes
- Developer Resources

Nested details can be in the same file as the steps to which it applies; for example, the Prerequisites section can reside in the same file as Building the Project.


## Within an .md File

The following product names are proper nouns and should be treated as such.  You should generally omit 'the' in front of the name unless using the name as an adjective to describe software, files, or other project artifacts:

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

Troubleshooting and problem solving sections should be added to a separate Troubleshooting section, rather than included in a section at the end of multiple doc files.  The Troubleshooting section should be sorted, and have sub-sections for topics like:

* connection issues
* authentication issues
* API-related issues
etc.

There should not be a 'Next Steps' section at the end of a proper documentation page - if the page needs links at the end, consider including a link to:

* the Troubleshooting page: For help with the topics on this page, visit Troubleshooting ().
* the Index

Document files should be named in the form my_file.md, and docs for each project should like in the `docs` folder (or sub-directories).

Each file should have one first level heading, and multiple second level headings.  Third and fourth level headings should be used for prominent content below the hierarchically-previous heading level.

Each heading should have an introductory sentence or paragraph that explains the feature shown/discussed in the following section.

Wrap lines to 79 characters long, but keep standard inline markdown links all be on the same line.

Replace em-dashes with regular dashes (hyphens).

Replace bullet items that are in the form: **Semantic matching:** uses pgvector for similarity-based cache lookups   
  with complete sentences - for example: Semantic matching uses pgvector for similarity-based cache lookups.

Remove bold formatting used as headings or for inline emphasis.

Write in active voice.
Use full and grammatically correct sentences that are between 7 and 20 words long.
Use a semi-colon to link similar ideas or manage sentences that are getting over-long.
Use articles (a, an, and the) when appropriate.

Do not refer to an object as 'it' unless the object 'it' refers to is in the same sentence. It is sometimes ambiguous!

If the page has a `Features` or `Overview` section following the introductory paragraph, it should not start with a heading; instead use a sentence in the form:  "The MCP Server includes the following features:", followed by a bulleted list of the features.  When formatting a bulleted list:

* Always leave a blank line before the first item in any list or sub-list (a sub-list may be code or indented bullets under a bullet item).
* Each entry in a bulleted list should be a complete sentence with articles.
* Do not use bold font bullet items.
* Do not use a numbered list unless the steps in the list need to be performed in order.

If a section contains code or a code snippet, there should be an explanatory sentence before the code in the form: In the following example, the command_name command uses a column named my_column to accomplish description-of-what-the-code-does.

Use a single quote around a single command or line of code:  `SELECT * FROM my code;`

Use block quotes around multi-line code samples and include the code type in the format tag:

```sql
SELECT * FROM code;
SELECT * FROM code;
SELECT * FROM code;
```

`stdio`, `stdin`, `stdout`, and `stderr` should be in courier (enclosed in backticks).

Capitalize command keywords; lowercase variables.

Include links to third-party software installation/documentation pages in the Prerequisites section.

Include links to our Github repo when we refer to cloning the repo, or working on the project.

LICENCE.md should live in the docs folder and in the root of each repo.  Create a copy of the LICENCE.md file in the docs folder if there isn't one there already.

Do not create links to github.io.




README.md file notes:

At the top of each README file:

* Include Github Action badges for important actions in use by the repository.
* Include test deployment links (if used for the project).
* Include a Table of Contents that mimics the nav section of the mkdocs.yaml file.
* After the TOC include a link to the online docs, hosted at docs.pgedge.com.

README files should contain the steps required to get started with the project.

This includes the commands to satisfy prerequisites, commands to build/install the binary/project, and notes about the minimal configuration changes required to deploy.

The prerequisites section should link to download/documentation links for third-party software when possible.

In the deployment section, include links to the Installation, Configuration, and Usage pages in the docs/ folder.


At the end of the README:

Include a link to the Issues page for the project:  "To report an issue with the software, visit:"

Include a section/link for Developers/Project contributers that links to developer documentation if available (and if developer documentation is not available, link to the GH site): "We welcome your project contributions; for more information, see docs/developers.md."

Include a link to the online documentation at:  For more information, visit [docs.pgedge.com](docs.pgedge.com)

Last thing in the file, include the sentence: "This project is licensed under the [PostgreSQL License](LICENCE.md)."

The link in that sentence should point to either a symlink from the root of the repo or the version of the LICENCE.md file that resides in the docs folder.
