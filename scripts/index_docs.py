#!/usr/bin/env python3
"""
Documentation Indexing Script for RAG System

This script indexes all markdown files in the Docs/ folder into a ChromaDB
vector database for semantic search via the MCP server.

Usage:
    python scripts/index_docs.py [--no-progress]
"""

import os
import re
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Tuple
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# Configuration
DOCS_FOLDER = "Docs"
CHROMA_DB_PATH = ".chroma"
COLLECTION_NAME = "documentation"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # Fast, good quality, 384 dimensions
CHUNK_SIZE = 1000  # Target tokens per chunk
CHUNK_OVERLAP = 100  # Overlap between chunks


class DocumentChunker:
    """Chunks markdown documents semantically by headers"""

    def __init__(self, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_by_headers(self, content: str, file_path: str) -> List[Dict]:
        """
        Chunk markdown content by headers, preserving structure

        Returns list of chunks with metadata:
        - text: chunk content
        - file_path: source file
        - headers: list of parent headers
        - section: current section name
        """
        chunks = []

        # Split by headers (# ## ### etc)
        header_pattern = r'^(#{1,6})\s+(.+)$'
        lines = content.split('\n')

        current_headers = []
        current_section = ""
        current_chunk = []
        current_size = 0

        for line in lines:
            header_match = re.match(header_pattern, line, re.MULTILINE)

            if header_match:
                # Save previous chunk if it exists
                if current_chunk:
                    chunks.append({
                        'text': '\n'.join(current_chunk),
                        'file_path': file_path,
                        'headers': current_headers.copy(),
                        'section': current_section
                    })

                # Update header hierarchy
                level = len(header_match.group(1))
                header_text = header_match.group(2).strip()

                # Update current_headers to maintain hierarchy
                current_headers = current_headers[:level-1] + [header_text]
                current_section = header_text

                # Start new chunk
                current_chunk = [line]
                current_size = len(line)
            else:
                # Add line to current chunk
                current_chunk.append(line)
                current_size += len(line)

                # If chunk is too large, split it
                if current_size > self.chunk_size:
                    chunks.append({
                        'text': '\n'.join(current_chunk),
                        'file_path': file_path,
                        'headers': current_headers.copy(),
                        'section': current_section
                    })

                    # Keep overlap
                    overlap_lines = current_chunk[-self.overlap // 50:]  # Rough estimate
                    current_chunk = overlap_lines
                    current_size = sum(len(l) for l in overlap_lines)

        # Save final chunk
        if current_chunk:
            chunks.append({
                'text': '\n'.join(current_chunk),
                'file_path': file_path,
                'headers': current_headers.copy(),
                'section': current_section
            })

        return chunks


def find_markdown_files(docs_folder: str) -> List[Path]:
    """Find all markdown files in Docs folder"""
    docs_path = Path(docs_folder)
    if not docs_path.exists():
        raise FileNotFoundError(f"Docs folder not found: {docs_folder}")

    md_files = list(docs_path.rglob("*.md"))
    return md_files


def index_documents(docs_folder: str, chroma_path: str, collection_name: str, show_progress: bool = True):
    """Main indexing function"""

    print(f"Starting documentation indexing...")
    print(f"Docs folder: {docs_folder}")
    print(f"ChromaDB path: {chroma_path}")
    print(f"Collection: {collection_name}")
    print()
    sys.stdout.flush()  # Ensure output is flushed immediately

    # Initialize embedding model
    print("Loading embedding model (all-MiniLM-L6-v2)...")
    sys.stdout.flush()
    model = SentenceTransformer(EMBEDDING_MODEL)
    print("Model loaded\n")
    sys.stdout.flush()

    # Initialize ChromaDB
    print("Initializing ChromaDB...")
    client = chromadb.PersistentClient(
        path=chroma_path,
        settings=Settings(anonymized_telemetry=False)
    )

    # Delete existing collection if it exists
    try:
        client.delete_collection(collection_name)
        print(f"Deleted existing collection: {collection_name}")
    except:
        pass

    # Create new collection
    collection = client.create_collection(
        name=collection_name,
        metadata={"description": "Project documentation for RAG"}
    )
    print(f"Created collection: {collection_name}\n")

    # Find all markdown files
    print(f"Scanning for markdown files in {docs_folder}/...")
    md_files = find_markdown_files(docs_folder)
    print(f"Found {len(md_files)} markdown files\n")

    if not md_files:
        print("No markdown files found. Exiting.")
        return

    # Process files
    chunker = DocumentChunker(CHUNK_SIZE, CHUNK_OVERLAP)
    all_chunks = []

    print("Processing files...")
    sys.stdout.flush()

    # Use tqdm only if show_progress is True
    file_iterator = tqdm(md_files, desc="Reading files", disable=not show_progress)
    for md_file in file_iterator:
        try:
            # Read file content
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Get relative path
            rel_path = os.path.relpath(md_file, docs_folder)

            # Chunk document
            chunks = chunker.chunk_by_headers(content, rel_path)
            all_chunks.extend(chunks)

        except Exception as e:
            print(f"\nError processing {md_file}: {e}")
            sys.stdout.flush()

    print(f"\nCreated {len(all_chunks)} chunks from {len(md_files)} files")
    sys.stdout.flush()

    # Generate embeddings and store
    print("\nGenerating embeddings and storing in ChromaDB...")
    sys.stdout.flush()

    batch_size = 100
    batch_iterator = tqdm(range(0, len(all_chunks), batch_size), desc="Indexing chunks", disable=not show_progress)
    for i in batch_iterator:
        batch = all_chunks[i:i + batch_size]

        # Prepare data for batch
        texts = [chunk['text'] for chunk in batch]
        ids = [f"chunk_{i+j}" for j in range(len(batch))]
        metadatas = [
            {
                'file_path': chunk['file_path'],
                'headers': ' > '.join(chunk['headers']),
                'section': chunk['section']
            }
            for chunk in batch
        ]

        # Generate embeddings
        embeddings = model.encode(texts, show_progress_bar=False).tolist()

        # Add to collection
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )

    print("\nIndexing complete!")
    sys.stdout.flush()
    print(f"Stats:")
    print(f"   - Files indexed: {len(md_files)}")
    print(f"   - Total chunks: {len(all_chunks)}")
    print(f"   - Collection: {collection_name}")
    print(f"   - Storage: {chroma_path}/")
    print("\nDocumentation is ready for semantic search via MCP server!")
    sys.stdout.flush()


if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Index documentation for RAG system")
    parser.add_argument('--no-progress', action='store_true',
                       help='Disable progress bars (useful when run from subprocess)')
    args = parser.parse_args()

    try:
        index_documents(DOCS_FOLDER, CHROMA_DB_PATH, COLLECTION_NAME,
                       show_progress=not args.no_progress)
    except Exception as e:
        print(f"\nError: {e}")
        sys.stdout.flush()
        import traceback
        traceback.print_exc()
        exit(1)
