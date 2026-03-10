# Documentation

Each public project should have a docs folder that contains source documentation files in simple markdown format.  

The LICENSE.md file should be stored in the docs folder; aliases don't work properly with MkDocs.

## Formatting README files

This section of the stylesheet applies to the README files that reside in each of our public repos - every
public repo should have a README file.  The top of each README should include:

* a first-level heading (#) identifying the project by name (# Project Name).
* if applicable, links to regression testing tools or developer/dba tools
* Github Action badges for important actions in use by the repository.

The heading info noted above should be followed by a Table of Contents (TOC) heading and links that build the TOC with the contents of the docs folder:

* A second-level heading (## Table of Contents)

That heading is followed by a bulleted list of linked content that resides in the docs folder.  Top level entries in the TOC should mirror the mkdocs.yaml file nav panel list for the project, and link to the same .md file used in our online documentation (docs/file_name.md); second-level links in the hierarchy may refer to content within a .md file (docs/file_name/#section_name):

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

Include a link to the Issues page for the project:  "To report an issue with the software, visit:"

If applicable, include a section/link for Developers/Project contributers that links to developer documentation if available (and if developer documentation is not available, link to the GH site): "We welcome your project contributions; for more information, see docs/developers.md."

Include a link to the online documentation at:  For more information, visit [docs.pgedge.com](docs.pgedge.com)

At the end of each README file, include a license section: 

## License

This project is licensed under the [PostgreSQL License](LICENSE.md).






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


## Within a .md File - Formatting Content Pages

Document files should be named in the form my_file.md, and docs for each project should like in the `docs` folder (or sub-directories of the `docs` folder).

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


Each file should have one first level heading, and multiple second level headings.  Third and fourth level headings should be used for prominent content below the hierarchically-previous heading level. 

* Each heading should have an introductory sentence or paragraph that explains the feature shown/discussed in the following section.
* Wrap lines to 79 characters long, but keep standard inline markdown links all be on the same line.
* Replace em-dashes with regular dashes (hyphens).
* Remove bold highlighted text content - it is identified as a heading level by some software.
* 



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



### Troubleshooting Sections

Troubleshooting and problem solving sections should be added to a separate Troubleshooting section, rather than included in a section at the end of multiple doc files.  The Troubleshooting section should be sorted, and have sub-sections for topics like:

* connection issues
* authentication issues
* API-related issues
etc.

### Next Steps Sections

As a rule, we don't include a 'Next Steps' section at the end of a technical documentation page - this content should be reserved primarily for Overview, Architecture, and Getting Started Pages

If the page needs links at the end, consider including a link to the Troubleshooting page: 

- For help with the topics on this page, visit Troubleshooting ().





