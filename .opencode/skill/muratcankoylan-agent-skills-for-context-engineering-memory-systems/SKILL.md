---
name: muratcankoylan-agent-skills-for-context-engineering-memory-systems
description: Context management and persistent memory systems for AI agents. Use when optimizing context windows or building agent memory systems.
---

# Context Engineering & Memory Systems

## Purpose

Optimize AI agent context management and build persistent memory systems.

## Context Engineering

### Principles

1. **Relevance**: Include only contextually relevant information
2. **Hierarchy**: Organize context by importance
3. **Freshness**: Prioritize recent information
4. **Compression**: Summarize long contexts

### Techniques

#### Context Window Management

- Sliding window for conversations
- Summarization for long documents
- Chunking for large codebases
- Priority scoring for relevance

#### Context Injection

- System prompts
- Few-shot examples
- Retrieved documents
- Conversation history

## Memory Systems

### Short-Term Memory

- Current conversation context
- Active task information
- Recent actions and results

### Long-Term Memory

- Persistent knowledge storage
- Learned patterns and solutions
- Historical decisions

### Implementation

#### File-Based Memory

```
.opencode/memory/
├── cmz-knowledge.md      # Solutions and patterns
├── cmz-issues.md         # Known issues and resolutions
└── cmz-evolution.md      # Change history
```

#### Vector Memory (Future)

- Embeddings for semantic search
- Similarity matching
- Automatic retrieval

## Context Engineering Patterns

### Pattern 1: Progressive Disclosure

Start with minimal context, expand as needed.

### Pattern 2: Selective Retrieval

Retrieve only relevant information from memory.

### Pattern 3: Hierarchical Summarization

Maintain summaries at different levels of detail.

### Pattern 4: Temporal Weighting

Weight recent information more heavily.

## Best Practices

1. **Regular Cleanup**: Remove outdated context
2. **Explicit Storage**: Store important learnings explicitly
3. **Retrieval Testing**: Test memory retrieval accuracy
4. **Context Monitoring**: Monitor context size and relevance

## Integration

Works with CMZ self-learning protocol for continuous improvement.

## Usage

Apply when:

- Managing large codebases
- Long-running conversations
- Building agent memory
- Optimizing context usage
