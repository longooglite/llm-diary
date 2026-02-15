Below is a paste-ready PLAN / CONTEXT DOCUMENT intended to be ingested by another LLM so it can correctly understand, reason about, and extend the diary system.
It is written as system-level architectural context, not conversational prose.

PLAN: Event-Sourced Personal Diary & Insight System
Purpose

This system captures low-friction personal and professional events as immutable facts, derives structured metadata from those facts, and periodically produces durable Markdown artifacts (daily, weekly, monthly) that summarize activity, decisions, and outcomes.

LLMs are used only for bounded batch reasoning tasks, not for real-time interaction or storage.

The system prioritizes:

Low operational cost

Auditability

Rebuildability

Human-readable outputs

Long-term usefulness for reflection, work narratives, and decision support

Core Design Principles

Event sourcing

All user input is stored as raw, append-only events.

No raw event is mutated or deleted.

All structure, summaries, and insights are derived.

LLMs are not the source of truth

LLM outputs are artifacts, not authoritative data.

Artifacts can be deleted and regenerated at any time.

Markdown as the primary interface

Summaries are emitted as .md files.

Files are readable without the application.

Files are suitable for Git, Obsidian, static sites, or archives.

LLM usage is scheduled and bounded

No LLM calls on event ingestion.

LLM calls occur on daily / weekly / monthly boundaries or manual triggers.

Token usage is explicitly constrained.

High-Level Architecture
[ Clients (Cognito authentication) ]
|
v
[ Ingestion API (Appsync) ]
|
v
[ Event Store (DynamoDB) ]
|
+--> [ Metadata Extraction (Batch) ]
| |
| v
| [ Derived Metadata ]
|
v
[ Time-Window Aggregation ]
|
v
[ LLM Summarization ]
|
v
[ Markdown Artifact Store (S3) ]
|
v
[ Read Interfaces (Static / Sync / Viewer) ]

Component Responsibilities

1. Clients

CLI, web UI, mobile shortcut, or chat interface

Emit short natural-language statements such as:

meals

expenses

job applications

work sessions

to-dos and completions

decisions

No parsing or intelligence on the client

2. Ingestion API (AppSync)

Accepts log events via GraphQL mutations

Performs authentication and timestamp normalization

Writes raw events to DynamoDB

Does not:

Call an LLM

Categorize deeply

Generate summaries

3. Event Store (DynamoDB)

Role: System of record

Data characteristics

Append-only

Time-ordered

Partitioned by user

Conceptual schema

Partition key: USER#<id>

Sort key: EVENT#<timestamp>#<uuid>

Attributes:

raw_text

source

created_at

4. Metadata Extraction (Optional, Derived)

Purpose

Provide structured querying without reprocessing raw text

Reduce LLM context size for summaries

Mechanism

Batch Lambda processes recent events

LLM performs narrow classification/extraction

Writes derived metadata items

Examples

category (expense, meal, todo, work)

amounts and currencies

todo state

project or topic

Metadata is disposable and rebuildable.

5. Time-Window Aggregation

Purely deterministic logic

Daily (calendar day)

Weekly (ISO week or rolling)

Monthly (calendar month)

Outputs

Grouped events

Pre-computed totals

Open vs completed items

No natural language generation

6. LLM Summarization Layer

Invocation rules

Triggered only after aggregation

Scheduled or manually requested

One call per time window

Inputs

Pre-filtered, structured data

Explicit instructions

Hard limits on length and scope

Responsibilities

Produce concise, factual summaries

Group information meaningfully

Highlight changes, totals, and outcomes

Avoid speculation or invention

7. Markdown Artifact Store (S3)

Artifacts

daily/YYYY-MM-DD.md

weekly/YYYY-WW.md

monthly/YYYY-MM.md

Properties

Versioned

Immutable once written (except regeneration)

Human-readable

Diff-friendly

Markdown files are the primary consumable output of the system.

8. Read Interfaces

Possible consumers:

Static site (Amplify / Pages)

Local sync (Obsidian, editor)

Minimal web dashboard

Git repository

The application UI is optional; the artifacts are sufficient.

Data Types Captured

Core categories:

Meals

Expenses

To-dos (open / completed)

Job search events

Work sessions

Decisions and rationale

Learning activity

Maintenance / admin events

Optional mood or energy annotations (low resolution)

Each capture is short, factual, and timestamped.

What the System Produces

Daily factual summaries

Weekly retrospectives

Monthly roll-ups

Evidence for:

performance reviews

resumes

interviews

budgeting and forecasting

long-term reflection

Non-Goals

Real-time conversational AI

Medical or biometric analysis

Fine-grained time tracking

Sentiment analysis of every entry

Optimization of every activity

Mental Model

This system functions as:

An external working memory

A fact ledger

A summary and narrative generator

It is not a life optimizer or recommendation engine by default.

Rebuild Guarantee

At any time:

Delete all metadata

Delete all summaries

Replay raw events

Regenerate all artifacts deterministically

Raw events are the only irreplaceable data.

Summary Statement

This diary scheme treats daily life as immutable events, LLMs as scheduled summarizers, and Markdown artifacts as durable memory objects suitable for reflection, professional leverage, and long-term understanding.
