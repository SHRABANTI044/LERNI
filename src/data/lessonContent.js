export const lessonContent = {
  // ==================== DATA STRUCTURES ====================
  'Stack': {
    sections: [
      {
        title: "Introduction to Stack",
        content: `A Stack is a linear data structure that follows the Last In First Out (LIFO) principle.

Think of it like a stack of plates - you can only add or remove plates from the top.

Key Characteristics:
• Elements are added and removed from the same end (top)
• Only the top element is accessible
• Follows LIFO (Last In, First Out) order`,
        image: "📚"
      },
      {
        title: "Stack Operations",
        content: `Main operations in a Stack:

1. Push - Add element to the top
   Example: stack.push(5)

2. Pop - Remove the top element
   Example: stack.pop()

3. Peek - View the top element
   Example: stack.peek()`,
        image: "⚙️"
      },
      {
        title: "Real-World Examples",
        content: `Stacks are used in:

1. Browser History - Back button
2. Undo/Redo - Text editors
3. Function Calls - Programming`,
        image: "🌍"
      }
    ]
  },

  'Queue': {
    sections: [
      {
        title: "Introduction to Queue",
        content: `A Queue is a linear data structure that follows First In First Out (FIFO).

Like a line at a ticket counter - first person in line is served first.

Key Characteristics:
• Elements added at rear (enqueue)
• Elements removed from front (dequeue)
• Follows FIFO order`,
        image: "🎫"
      },
      {
        title: "Queue Operations",
        content: `Main operations:

1. Enqueue - Add to rear
   Example: queue.enqueue(5)

2. Dequeue - Remove from front
   Example: queue.dequeue()

3. Front - View front element
   Example: queue.front()`,
        image: "⚙️"
      },
      {
        title: "Applications",
        content: `Queues are used in:

1. Print Queue - Documents
2. Task Scheduling - OS
3. Customer Service - Call centers`,
        image: "🌍"
      }
    ]
  },

  'Linked List': {
    sections: [
      {
        title: "Introduction to Linked List",
        content: `A Linked List is a linear data structure where elements are stored in nodes.

Each node contains data and a reference to the next node.

Key Characteristics:
• Dynamic size
• Easy insertion/deletion
• No random access`,
        image: "🔗"
      },
      {
        title: "Types of Linked Lists",
        content: `Three main types:

1. Singly Linked List
   • One direction only

2. Doubly Linked List
   • Two directions (prev & next)

3. Circular Linked List
   • Last node points to first`,
        image: "📊"
      },
      {
        title: "Use Cases",
        content: `Linked Lists are used in:

1. Music Playlists
2. Browser Navigation
3. Image Viewer (next/previous)`,
        image: "🎵"
      }
    ]
  },

  'Binary Tree': {
    sections: [
      {
        title: "Introduction to Binary Tree",
        content: `A Binary Tree is a hierarchical data structure where each node has at most two children.

Key Characteristics:
• Root node at top
• Each node has left and right child
• Leaf nodes have no children`,
        image: "🌳"
      },
      {
        title: "Tree Traversals",
        content: `Three main traversals:

1. Inorder (Left-Root-Right)
2. Preorder (Root-Left-Right)
3. Postorder (Left-Right-Root)

Each serves different purposes.`,
        image: "🔄"
      },
      {
        title: "Applications",
        content: `Binary Trees are used in:

1. File Systems - Folders
2. Expression Parsing
3. Decision Trees - AI`,
        image: "💼"
      }
    ]
  },

  'Hash Table': {
    sections: [
      {
        title: "Introduction to Hash Table",
        content: `A Hash Table stores key-value pairs using a hash function.

Provides fast lookup, insertion, and deletion.

Key Characteristics:
• O(1) average time complexity
• Uses hash function
• Handles collisions`,
        image: "🗂️"
      },
      {
        title: "Hash Functions",
        content: `Hash function converts keys to indices:

Key → Hash Function → Index

Good hash functions:
• Uniform distribution
• Fast computation
• Deterministic`,
        image: "🔢"
      },
      {
        title: "Real-World Uses",
        content: `Hash Tables power:

1. Databases - Indexing
2. Caching - Fast retrieval
3. Password Storage`,
        image: "🔐"
      }
    ]
  },

  'Graph': {
    sections: [
      {
        title: "Introduction to Graph",
        content: `A Graph is a non-linear data structure with nodes (vertices) connected by edges.

Key Characteristics:
• Vertices and edges
• Can be directed or undirected
• Can have cycles`,
        image: "🕸️"
      },
      {
        title: "Graph Representations",
        content: `Two main ways:

1. Adjacency Matrix
   • 2D array
   • Fast edge lookup

2. Adjacency List
   • Array of lists
   • Space efficient`,
        image: "📋"
      },
      {
        title: "Applications",
        content: `Graphs are used in:

1. Social Networks - Friends
2. Maps - Navigation
3. Web Pages - Links`,
        image: "🌐"
      }
    ]
  },

  // ==================== ALGORITHMS ====================
  'Bubble Sort': {
    sections: [
      {
        title: "Introduction to Bubble Sort",
        content: `Bubble Sort repeatedly compares adjacent elements and swaps them if wrong order.

Smaller elements "bubble" to the top.

Key Characteristics:
• Simple algorithm
• Time: O(n²)
• Space: O(1)`,
        image: "🫧"
      },
      {
        title: "How It Works",
        content: `Step-by-step:

1. Compare adjacent elements
2. Swap if in wrong order
3. Repeat until sorted

Example: [5,2,8,1]
→ [2,5,1,8]
→ [2,1,5,8]
→ [1,2,5,8] ✓`,
        image: "🔄"
      },
      {
        title: "When to Use",
        content: `Best for:

1. Small datasets
2. Nearly sorted data
3. Learning purposes

Avoid for large datasets!`,
        image: "💡"
      }
    ]
  },

  'Binary Search': {
    sections: [
      {
        title: "Introduction to Binary Search",
        content: `Binary Search finds items in sorted arrays by dividing search space in half.

Like finding a word in dictionary!

Key Characteristics:
• Requires sorted array
• Time: O(log n)
• Very efficient`,
        image: "🔍"
      },
      {
        title: "Algorithm Steps",
        content: `How it works:

1. Find middle element
2. Compare with target
3. Search left or right half
4. Repeat until found

Much faster than linear search!`,
        image: "🎯"
      },
      {
        title: "Applications",
        content: `Used in:

1. Database searches
2. Search engines
3. Game development
4. File systems`,
        image: "🌍"
      }
    ]
  },

  'Quick Sort': {
    sections: [
      {
        title: "Introduction to Quick Sort",
        content: `Quick Sort uses divide-and-conquer strategy with a pivot element.

One of the fastest sorting algorithms!

Key Characteristics:
• Time: O(n log n) average
• In-place sorting
• Recursive algorithm`,
        image: "⚡"
      },
      {
        title: "How It Works",
        content: `Steps:

1. Choose pivot element
2. Partition array around pivot
3. Recursively sort sub-arrays

Pivot selection is crucial!`,
        image: "🎲"
      },
      {
        title: "Use Cases",
        content: `Quick Sort is used in:

1. Programming languages
2. Database systems
3. Operating systems

Very popular in practice!`,
        image: "🚀"
      }
    ]
  },

  'Merge Sort': {
    sections: [
      {
        title: "Introduction to Merge Sort",
        content: `Merge Sort divides array into halves, sorts them, and merges back.

Stable and predictable performance!

Key Characteristics:
• Time: O(n log n) always
• Space: O(n)
• Stable sort`,
        image: "🔀"
      },
      {
        title: "Algorithm Process",
        content: `Two phases:

1. Divide Phase
   • Split array in half recursively

2. Merge Phase
   • Combine sorted halves

Guaranteed performance!`,
        image: "📊"
      },
      {
        title: "Applications",
        content: `Used in:

1. External sorting
2. Linked list sorting
3. Parallel processing`,
        image: "💻"
      }
    ]
  },

  'Dynamic Programming': {
    sections: [
      {
        title: "Introduction to Dynamic Programming",
        content: `Dynamic Programming solves complex problems by breaking into simpler subproblems.

Stores results to avoid recomputation!

Key Characteristics:
• Optimal substructure
• Overlapping subproblems
• Memoization`,
        image: "🧩"
      },
      {
        title: "Approaches",
        content: `Two main approaches:

1. Top-Down (Memoization)
   • Recursive with caching

2. Bottom-Up (Tabulation)
   • Iterative approach

Both avoid redundant work!`,
        image: "📈"
      },
      {
        title: "Classic Problems",
        content: `DP solves:

1. Fibonacci sequence
2. Knapsack problem
3. Shortest path
4. String matching`,
        image: "🎯"
      }
    ]
  },

  'Greedy Algorithms': {
    sections: [
      {
        title: "Introduction to Greedy",
        content: `Greedy algorithms make locally optimal choices hoping for global optimum.

Simple but powerful approach!

Key Characteristics:
• Makes best choice at each step
• No backtracking
• Fast execution`,
        image: "🎰"
      },
      {
        title: "When Greedy Works",
        content: `Greedy works when:

1. Greedy choice property
2. Optimal substructure

Not always optimal!
Must prove correctness.`,
        image: "✅"
      },
      {
        title: "Examples",
        content: `Greedy algorithms:

1. Coin change
2. Activity selection
3. Huffman coding
4. Dijkstra's algorithm`,
        image: "💰"
      }
    ]
  },

  // ==================== WEB DEVELOPMENT ====================
  'HTML Basics': {
    sections: [
      {
        title: "Introduction to HTML",
        content: `HTML (HyperText Markup Language) structures web pages.

Foundation of every website!

Key Concepts:
• Uses tags like <div>, <p>
• Tags come in pairs
• Provides page structure`,
        image: "🌐"
      },
      {
        title: "Basic Structure",
        content: `HTML page structure:

<!DOCTYPE html>
<html>
  <head>
    <title>Title</title>
  </head>
  <body>
    <h1>Heading</h1>
    <p>Paragraph</p>
  </body>
</html>`,
        image: "📝"
      },
      {
        title: "Common Tags",
        content: `Essential HTML tags:

• <h1>-<h6> Headings
• <p> Paragraphs
• <a> Links
• <img> Images
• <div> Containers`,
        image: "🏷️"
      }
    ]
  },

  'CSS Styling': {
    sections: [
      {
        title: "Introduction to CSS",
        content: `CSS (Cascading Style Sheets) styles HTML elements.

Makes websites beautiful!

Key Concepts:
• Selectors target elements
• Properties define styles
• Cascading rules apply`,
        image: "🎨"
      },
      {
        title: "CSS Syntax",
        content: `Basic CSS structure:

selector {
  property: value;
}

Example:
h1 {
  color: blue;
  font-size: 24px;
}`,
        image: "✍️"
      },
      {
        title: "Layout Techniques",
        content: `Modern CSS layouts:

1. Flexbox - 1D layouts
2. Grid - 2D layouts
3. Positioning
4. Responsive design`,
        image: "📐"
      }
    ]
  },

  'JavaScript Fundamentals': {
    sections: [
      {
        title: "Introduction to JavaScript",
        content: `JavaScript adds interactivity to web pages.

The programming language of the web!

Key Features:
• Runs in browser
• Dynamic typing
• Event-driven`,
        image: "⚡"
      },
      {
        title: "Core Concepts",
        content: `JavaScript basics:

1. Variables (let, const, var)
2. Functions
3. Objects and Arrays
4. DOM Manipulation
5. Events`,
        image: "📚"
      },
      {
        title: "Modern JavaScript",
        content: `ES6+ features:

• Arrow functions
• Template literals
• Destructuring
• Async/await
• Modules`,
        image: "🚀"
      }
    ]
  },

  'React Components': {
    sections: [
      {
        title: "Introduction to React",
        content: `React is a JavaScript library for building user interfaces.

Component-based architecture!

Key Concepts:
• Components
• Props
• State
• Virtual DOM`,
        image: "⚛️"
      },
      {
        title: "Component Types",
        content: `Two types:

1. Functional Components
   • Modern approach
   • Use hooks

2. Class Components
   • Traditional way
   • Lifecycle methods`,
        image: "🧱"
      },
      {
        title: "React Hooks",
        content: `Essential hooks:

• useState - State management
• useEffect - Side effects
• useContext - Context API
• Custom hooks`,
        image: "🪝"
      }
    ]
  },

  'REST APIs': {
    sections: [
      {
        title: "Introduction to REST APIs",
        content: `REST (Representational State Transfer) is an architectural style for APIs.

Standard way for systems to communicate!

Key Principles:
• Stateless
• Client-server
• Cacheable`,
        image: "🔌"
      },
      {
        title: "HTTP Methods",
        content: `CRUD operations:

• GET - Read data
• POST - Create data
• PUT - Update data
• DELETE - Remove data

Status codes indicate results!`,
        image: "📡"
      },
      {
        title: "API Design",
        content: `Best practices:

1. Use nouns for endpoints
2. Version your API
3. Use proper status codes
4. Document everything`,
        image: "📖"
      }
    ]
  },

  'Authentication & Security': {
    sections: [
      {
        title: "Web Security Basics",
        content: `Security protects users and data.

Critical for any application!

Key Concepts:
• Authentication
• Authorization
• Encryption
• HTTPS`,
        image: "🔐"
      },
      {
        title: "Authentication Methods",
        content: `Common approaches:

1. Session-based
   • Cookies and sessions

2. Token-based
   • JWT tokens

3. OAuth
   • Third-party login`,
        image: "🔑"
      },
      {
        title: "Security Best Practices",
        content: `Protect your app:

• Hash passwords
• Use HTTPS
• Validate input
• Prevent XSS/CSRF
• Rate limiting`,
        image: "🛡️"
      }
    ]
  },

  // ==================== MACHINE LEARNING ====================
  'Introduction to ML': {
    sections: [
      {
        title: "What is Machine Learning?",
        content: `Machine Learning enables computers to learn from data.

AI that improves with experience!

Key Concepts:
• Learning from data
• Making predictions
• Pattern recognition`,
        image: "🤖"
      },
      {
        title: "Types of ML",
        content: `Three main types:

1. Supervised Learning
   • Labeled data

2. Unsupervised Learning
   • Find patterns

3. Reinforcement Learning
   • Trial and error`,
        image: "📊"
      },
      {
        title: "Applications",
        content: `ML powers:

• Recommendations (Netflix)
• Voice assistants (Siri)
• Image recognition
• Self-driving cars`,
        image: "🌟"
      }
    ]
  },

  'Linear Regression': {
    sections: [
      {
        title: "Introduction to Linear Regression",
        content: `Linear Regression predicts continuous values.

Finds best-fit line through data!

Key Concepts:
• Supervised learning
• Continuous output
• Simple yet powerful`,
        image: "📈"
      },
      {
        title: "How It Works",
        content: `The equation:

y = mx + b

Where:
• y = predicted value
• m = slope
• x = input
• b = intercept

Minimize error!`,
        image: "📐"
      },
      {
        title: "Use Cases",
        content: `Linear regression for:

• House price prediction
• Sales forecasting
• Trend analysis
• Risk assessment`,
        image: "🏠"
      }
    ]
  },

  'Classification': {
    sections: [
      {
        title: "Introduction to Classification",
        content: `Classification assigns items to categories.

Supervised learning for discrete outputs!

Key Concepts:
• Binary classification
• Multi-class classification
• Decision boundaries`,
        image: "🎯"
      },
      {
        title: "Common Algorithms",
        content: `Popular classifiers:

1. Logistic Regression
2. Decision Trees
3. Random Forest
4. Support Vector Machines
5. Neural Networks`,
        image: "🌳"
      },
      {
        title: "Applications",
        content: `Classification used in:

• Email spam detection
• Disease diagnosis
• Image recognition
• Sentiment analysis`,
        image: "📧"
      }
    ]
  },

  'Neural Networks': {
    sections: [
      {
        title: "Introduction to Neural Networks",
        content: `Neural Networks mimic human brain structure.

Foundation of deep learning!

Key Components:
• Neurons (nodes)
• Layers (input, hidden, output)
• Weights and biases
• Activation functions`,
        image: "🧠"
      },
      {
        title: "How They Learn",
        content: `Learning process:

1. Forward propagation
   • Input → Output

2. Calculate error

3. Backpropagation
   • Adjust weights

4. Repeat until accurate`,
        image: "🔄"
      },
      {
        title: "Applications",
        content: `Neural networks power:

• Image recognition
• Speech recognition
• Language translation
• Game playing AI`,
        image: "🎮"
      }
    ]
  },

  'Deep Learning': {
    sections: [
      {
        title: "Introduction to Deep Learning",
        content: `Deep Learning uses multi-layer neural networks.

State-of-the-art AI!

Key Concepts:
• Many hidden layers
• Learns hierarchical features
• Requires lots of data`,
        image: "🏔️"
      },
      {
        title: "Popular Architectures",
        content: `Deep learning models:

1. CNN - Images
2. RNN - Sequences
3. LSTM - Long sequences
4. Transformers - NLP`,
        image: "🏗️"
      },
      {
        title: "Breakthroughs",
        content: `Deep learning achieved:

• Superhuman image recognition
• Natural language understanding
• Game mastery (AlphaGo)
• Autonomous driving`,
        image: "🚀"
      }
    ]
  },

  'Natural Language Processing': {
    sections: [
      {
        title: "Introduction to NLP",
        content: `NLP enables computers to understand human language.

Bridge between humans and machines!

Key Tasks:
• Text classification
• Sentiment analysis
• Translation
• Question answering`,
        image: "💬"
      },
      {
        title: "NLP Techniques",
        content: `Common approaches:

1. Tokenization
2. Word embeddings
3. Sequence models
4. Transformers (BERT, GPT)

Language is complex!`,
        image: "🔤"
      },
      {
        title: "Applications",
        content: `NLP powers:

• Chatbots
• Virtual assistants
• Translation services
• Content moderation`,
        image: "🤖"
      }
    ]
  },

  // ==================== DATABASE SYSTEMS ====================
  'SQL Basics': {
    sections: [
      {
        title: "Introduction to SQL",
        content: `SQL manages relational databases.

Standard language for data!

Key Concepts:
• Tables store data
• Queries retrieve data
• Declarative language`,
        image: "💾"
      },
      {
        title: "Basic Commands",
        content: `Essential SQL:

• SELECT - Read
• INSERT - Create
• UPDATE - Modify
• DELETE - Remove

CRUD operations!`,
        image: "⚡"
      },
      {
        title: "Real-World Use",
        content: `SQL everywhere:

• Web applications
• E-commerce
• Banking systems
• Social media`,
        image: "🌍"
      }
    ]
  },

  'Database Design': {
    sections: [
      {
        title: "Introduction to DB Design",
        content: `Good design ensures efficient, scalable databases.

Foundation of data management!

Key Principles:
• Normalization
• Relationships
• Constraints
• Indexes`,
        image: "🏗️"
      },
      {
        title: "Normalization",
        content: `Reduce redundancy:

1NF - Atomic values
2NF - No partial dependencies
3NF - No transitive dependencies

Organized data!`,
        image: "📊"
      },
      {
        title: "Relationships",
        content: `Three types:

• One-to-One
• One-to-Many
• Many-to-Many

Foreign keys connect tables!`,
        image: "🔗"
      }
    ]
  },

  'Joins & Relationships': {
    sections: [
      {
        title: "Introduction to Joins",
        content: `Joins combine data from multiple tables.

Essential for relational databases!

Key Concepts:
• Combine related data
• Use foreign keys
• Different join types`,
        image: "🔀"
      },
      {
        title: "Types of Joins",
        content: `Four main joins:

• INNER JOIN - Matching rows
• LEFT JOIN - All left + matches
• RIGHT JOIN - All right + matches
• FULL JOIN - All rows

Choose wisely!`,
        image: "🎯"
      },
      {
        title: "Practical Examples",
        content: `Joins used for:

• User orders
• Product categories
• Employee departments
• Student courses`,
        image: "📚"
      }
    ]
  },

  'Indexing & Optimization': {
    sections: [
      {
        title: "Introduction to Indexing",
        content: `Indexes speed up database queries.

Like a book index!

Key Concepts:
• Faster searches
• Trade-off: space vs speed
• Choose columns wisely`,
        image: "🚀"
      },
      {
        title: "Index Types",
        content: `Common indexes:

1. B-Tree - Default
2. Hash - Equality searches
3. Full-text - Text search
4. Composite - Multiple columns

Each has use cases!`,
        image: "🌳"
      },
      {
        title: "Query Optimization",
        content: `Optimize queries:

• Use indexes
• Avoid SELECT *
• Limit results
• Analyze query plans`,
        image: "⚡"
      }
    ]
  },

  'Transactions & ACID': {
    sections: [
      {
        title: "Introduction to Transactions",
        content: `Transactions ensure data consistency.

All or nothing approach!

Key Concepts:
• Group of operations
• Commit or rollback
• ACID properties`,
        image: "🔄"
      },
      {
        title: "ACID Properties",
        content: `Four guarantees:

• Atomicity - All or nothing
• Consistency - Valid state
• Isolation - Independent
• Durability - Permanent

Critical for reliability!`,
        image: "🛡️"
      },
      {
        title: "Use Cases",
        content: `Transactions for:

• Bank transfers
• Order processing
• Inventory management
• Booking systems`,
        image: "💳"
      }
    ]
  },

  'NoSQL Databases': {
    sections: [
      {
        title: "Introduction to NoSQL",
        content: `NoSQL databases handle unstructured data.

Alternative to relational databases!

Key Features:
• Flexible schema
• Horizontal scaling
• High performance`,
        image: "🗄️"
      },
      {
        title: "NoSQL Types",
        content: `Four categories:

1. Document (MongoDB)
2. Key-Value (Redis)
3. Column (Cassandra)
4. Graph (Neo4j)

Different use cases!`,
        image: "📦"
      },
      {
        title: "When to Use NoSQL",
        content: `Choose NoSQL for:

• Big data
• Real-time apps
• Flexible schemas
• Rapid development`,
        image: "🎯"
      }
    ]
  },

  // ==================== OPERATING SYSTEMS ====================
  'OS Introduction': {
    sections: [
      {
        title: "What is an Operating System?",
        content: `OS manages computer hardware and software.

Bridge between user and hardware!

Key Functions:
• Process management
• Memory management
• File systems
• Device management`,
        image: "💻"
      },
      {
        title: "Types of OS",
        content: `Common operating systems:

• Windows - Desktop
• Linux - Servers
• macOS - Apple
• Android/iOS - Mobile

Each has strengths!`,
        image: "🖥️"
      },
      {
        title: "Why OS Matters",
        content: `OS provides:

• Resource management
• User interface
• Security
• Application support`,
        image: "🔐"
      }
    ]
  },

  'Process Management': {
    sections: [
      {
        title: "Introduction to Processes",
        content: `A process is a program in execution.

OS manages multiple processes!

Key Concepts:
• Process states
• Context switching
• Scheduling
• Inter-process communication`,
        image: "⚙️"
      },
      {
        title: "Process States",
        content: `Five states:

1. New - Being created
2. Ready - Waiting for CPU
3. Running - Executing
4. Waiting - I/O operation
5. Terminated - Finished

State transitions!`,
        image: "🔄"
      },
      {
        title: "Scheduling Algorithms",
        content: `CPU scheduling:

• FCFS - First Come First Serve
• SJF - Shortest Job First
• Round Robin
• Priority Scheduling`,
        image: "📊"
      }
    ]
  },

  'Memory Management': {
    sections: [
      {
        title: "Introduction to Memory Management",
        content: `OS manages RAM allocation to processes.

Efficient memory use is critical!

Key Concepts:
• Address spaces
• Allocation strategies
• Paging
• Segmentation`,
        image: "🧠"
      },
      {
        title: "Memory Allocation",
        content: `Allocation methods:

1. Contiguous
   • Single block

2. Non-contiguous
   • Multiple blocks

3. Virtual Memory
   • Disk as RAM`,
        image: "📦"
      },
      {
        title: "Paging",
        content: `Paging divides memory:

• Fixed-size pages
• Page tables map addresses
• Reduces fragmentation

Modern OS standard!`,
        image: "📄"
      }
    ]
  },

  'File Systems': {
    sections: [
      {
        title: "Introduction to File Systems",
        content: `File systems organize and store data on disk.

How OS manages files!

Key Concepts:
• Files and directories
• File operations
• Access methods
• Protection`,
        image: "📁"
      },
      {
        title: "File System Types",
        content: `Common file systems:

• NTFS - Windows
• ext4 - Linux
• APFS - macOS
• FAT32 - Universal

Each optimized differently!`,
        image: "💾"
      },
      {
        title: "File Operations",
        content: `Basic operations:

• Create
• Read
• Write
• Delete
• Rename

OS provides interface!`,
        image: "✏️"
      }
    ]
  },

  'Deadlocks': {
    sections: [
      {
        title: "Introduction to Deadlocks",
        content: `Deadlock occurs when processes wait for each other indefinitely.

Circular waiting problem!

Key Concepts:
• Resource allocation
• Circular wait
• Prevention strategies`,
        image: "🔒"
      },
      {
        title: "Deadlock Conditions",
        content: `Four necessary conditions:

1. Mutual Exclusion
2. Hold and Wait
3. No Preemption
4. Circular Wait

All must be present!`,
        image: "🔄"
      },
      {
        title: "Handling Deadlocks",
        content: `Three approaches:

1. Prevention
   • Break conditions

2. Avoidance
   • Banker's algorithm

3. Detection & Recovery
   • Find and resolve`,
        image: "🛠️"
      }
    ]
  },

  'Virtual Memory': {
    sections: [
      {
        title: "Introduction to Virtual Memory",
        content: `Virtual memory uses disk as extended RAM.

Run larger programs!

Key Concepts:
• Logical vs physical addresses
• Demand paging
• Page replacement`,
        image: "💿"
      },
      {
        title: "How It Works",
        content: `Virtual memory process:

1. Program uses virtual addresses
2. OS maps to physical memory
3. Pages loaded on demand
4. Swap to disk if needed

Transparent to programs!`,
        image: "🔄"
      },
      {
        title: "Page Replacement",
        content: `Algorithms:

• FIFO - First In First Out
• LRU - Least Recently Used
• Optimal - Best possible

Minimize page faults!`,
        image: "📊"
      }
    ]
  }
};
