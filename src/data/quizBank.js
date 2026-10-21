export const quizQuestions = {
    'Data Structures': {
      'Stack': [
        {
          question: "What is a Stack data structure?",
          options: [
            "First In First Out (FIFO)",
            "Last In First Out (LIFO)",
            "Random Access",
            "Sequential Access"
          ],
          correct: 1
        },
        {
          question: "Which operation adds an element to the stack?",
          options: ["Pop", "Push", "Peek", "Delete"],
          correct: 1
        },
        {
          question: "What happens when you try to pop from an empty stack?",
          options: [
            "Returns null",
            "Stack Overflow",
            "Stack Underflow",
            "Returns 0"
          ],
          correct: 2
        },
        {
          question: "Which of these uses Stack internally?",
          options: [
            "Function call recursion",
            "Queue implementation",
            "Array sorting",
            "Hash table"
          ],
          correct: 0
        },
        {
          question: "What is the time complexity of Push operation?",
          options: ["O(n)", "O(log n)", "O(1)", "O(nÂ²)"],
          correct: 2
        }
      ],
      'Queue': [
        {
          question: "What is the primary characteristic of a Queue?",
          options: [
            "Last In First Out (LIFO)",
            "First In First Out (FIFO)",
            "Random Access",
            "Priority Based"
          ],
          correct: 1
        },
        {
          question: "Which operation removes an element from the front of a queue?",
          options: ["Pop", "Enqueue", "Dequeue", "Peek"],
          correct: 2
        },
        {
          question: "What is a priority queue?",
          options: [
            "A queue with no priorities",
            "Elements are removed based on priority",
            "A sorted queue",
            "A circular queue"
          ],
          correct: 1
        },
        {
          question: "Which data structure is used in Breadth-First Search?",
          options: ["Stack", "Queue", "Array", "Tree"],
          correct: 1
        },
        {
          question: "What is the time complexity of enqueue operation?",
          options: ["O(n)", "O(log n)", "O(1)", "O(nÂ²)"],
          correct: 2
        }
      ],
      'Linked List': [
        {
          question: "What is a linked list?",
          options: [
            "An array of elements",
            "A linear collection of nodes",
            "A hierarchical structure",
            "A hash table"
          ],
          correct: 1
        },
        {
          question: "What does each node in a linked list contain?",
          options: [
            "Only data",
            "Only pointer",
            "Data and pointer(s)",
            "Index and data"
          ],
          correct: 2
        },
        {
          question: "What is the time complexity of inserting at the beginning of a linked list?",
          options: ["O(n)", "O(log n)", "O(1)", "O(nÂ²)"],
          correct: 2
        },
        {
          question: "What is a doubly linked list?",
          options: [
            "List with two heads",
            "List that can be traversed in both directions",
            "Two separate lists",
            "List with duplicate elements"
          ],
          correct: 1
        },
        {
          question: "What is the main disadvantage of linked lists?",
          options: [
            "Slow insertion",
            "No random access",
            "Memory waste",
            "Complex deletion"
          ],
          correct: 1
        }
      ],
      'Binary Tree': [
        {
          question: "What is a binary tree?",
          options: [
            "A tree with only two nodes",
            "Each node has at most two children",
            "A tree with two levels",
            "A sorted tree"
          ],
          correct: 1
        },
        {
          question: "What is the root of a binary tree?",
          options: [
            "The bottom node",
            "The topmost node",
            "The middle node",
            "Any node"
          ],
          correct: 1
        },
        {
          question: "What is a leaf node?",
          options: [
            "The root node",
            "A node with no children",
            "A node with one child",
            "The largest node"
          ],
          correct: 1
        },
        {
          question: "What is the maximum number of nodes at level k in a binary tree?",
          options: ["k", "2k", "2^k", "k^2"],
          correct: 2
        },
        {
          question: "What is the height of a tree with one node?",
          options: ["0", "1", "2", "undefined"],
          correct: 1
        }
      ],
      'Hash Table': [
        {
          question: "What is hashing?",
          options: [
            "Sorting data",
            "Converting keys to array indices",
            "Encrypting data",
            "Compressing data"
          ],
          correct: 1
        },
        {
          question: "What is a collision in hash tables?",
          options: [
            "Two keys mapping to the same index",
            "Table is full",
            "Key not found",
            "Hash function fails"
          ],
          correct: 0
        },
        {
          question: "What is the ideal time complexity of hash table lookup?",
          options: ["O(n)", "O(log n)", "O(1)", "O(nÂ²)"],
          correct: 2
        },
        {
          question: "What is load factor in a hash table?",
          options: [
            "Number of elements / Table size",
            "Table size / Number of elements",
            "Hash value / Table size",
            "Collision count"
          ],
          correct: 0
        },
        {
          question: "What is chaining in hash tables?",
          options: [
            "Using multiple hash functions",
            "Storing colliding elements in a list",
            "Resizing the table",
            "Deleting old entries"
          ],
          correct: 1
        }
      ],
      'Graph': [
        {
          question: "What is a graph?",
          options: [
            "A linear data structure",
            "A collection of vertices and edges",
            "A hierarchical structure",
            "A tree structure"
          ],
          correct: 1
        },
        {
          question: "What is a directed graph?",
          options: [
            "Graph with weights",
            "Graph with directed edges",
            "Graph with cycles",
            "Connected graph"
          ],
          correct: 1
        },
        {
          question: "Which algorithm finds the shortest path in a weighted graph?",
          options: ["BFS", "DFS", "Dijkstra's", "Binary Search"],
          correct: 2
        },
        {
          question: "What is a cycle in a graph?",
          options: [
            "A path that starts and ends at the same vertex",
            "A path with no repeated vertices",
            "The longest path",
            "A disconnected path"
          ],
          correct: 0
        },
        {
          question: "What is the time complexity of BFS?",
          options: ["O(V)", "O(E)", "O(V + E)", "O(V * E)"],
          correct: 2
        }
      ]
    },
    'Algorithms': {
      'Bubble Sort': [
        {
          question: "What is the time complexity of Bubble Sort in the worst case?",
          options: ["O(n)", "O(log n)", "O(nÂ²)", "O(1)"],
          correct: 2
        },
        {
          question: "What is Bubble Sort's space complexity?",
          options: ["O(n)", "O(log n)", "O(1)", "O(nÂ²)"],
          correct: 2
        },
        {
          question: "Which statement is true about Bubble Sort?",
          options: [
            "It is a divide and conquer algorithm",
            "It compares adjacent elements",
            "It requires random access",
            "It always performs n-1 passes"
          ],
          correct: 1
        },
        {
          question: "When does Bubble Sort optimize by stopping early?",
          options: [
            "When array is already sorted",
            "When no swaps occur in a pass",
            "When half the array is sorted",
            "Never"
          ],
          correct: 1
        },
        {
          question: "Bubble Sort is also known as:",
          options: [
            "Selection Sort",
            "Exchange Sort",
            "Insertion Sort",
            "Merge Sort"
          ],
          correct: 1
        }
      ],
      'Binary Search': [
        {
          question: "What is the time complexity of Binary Search?",
          options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
          correct: 1
        },
        {
          question: "What is a prerequisite for Binary Search?",
          options: [
            "Unsorted array",
            "Sorted array",
            "Linked list",
            "Binary tree"
          ],
          correct: 1
        },
        {
          question: "How does Binary Search find the middle element?",
          options: [
            "Random selection",
            "(left + right) / 2",
            "Always the first element",
            "Always the last element"
          ],
          correct: 1
        },
        {
          question: "If the target is greater than middle, which half do we search?",
          options: ["Left half", "Right half", "Both halves", "Neither"],
          correct: 1
        },
        {
          question: "What is the space complexity of iterative Binary Search?",
          options: ["O(n)", "O(log n)", "O(1)", "O(nÂ²)"],
          correct: 2
        }
      ],
      'Quick Sort': [
        {
          question: "What is Quick Sort's average time complexity?",
          options: ["O(n)", "O(log n)", "O(n log n)", "O(nÂ²)"],
          correct: 2
        },
        {
          question: "What is the key operation in Quick Sort?",
          options: ["Merging", "Partitioning", "Swapping", "Searching"],
          correct: 1
        },
        {
          question: "What is the worst-case time complexity of Quick Sort?",
          options: ["O(n)", "O(log n)", "O(n log n)", "O(nÂ²)"],
          correct: 3
        },
        {
          question: "What is a pivot in Quick Sort?",
          options: [
            "The first element",
            "The last element",
            "An element used for partitioning",
            "The middle element always"
          ],
          correct: 2
        },
        {
          question: "Quick Sort is an example of:",
          options: [
            "Divide and Conquer",
            "Dynamic Programming",
            "Greedy Algorithm",
            "Brute Force"
          ],
          correct: 0
        }
      ],
      'Merge Sort': [
        {
          question: "What is the time complexity of Merge Sort?",
          options: ["O(n)", "O(log n)", "O(n log n)", "O(nÂ²)"],
          correct: 2
        },
        {
          question: "Merge Sort is a:",
          options: [
            "In-place algorithm",
            "Stable sort",
            "Adaptive sort",
            "Comparison-based only"
          ],
          correct: 1
        },
        {
          question: "What is the space complexity of Merge Sort?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
          correct: 2
        },
        {
          question: "Merge Sort divides the array into:",
          options: [
            "One half",
            "Two halves",
            "Three parts",
            "Four parts"
          ],
          correct: 1
        },
        {
          question: "The merge step in Merge Sort:",
          options: [
            "Is not necessary",
            "Requires extra space",
            "Only works on sorted arrays",
            "Is optional"
          ],
          correct: 1
        }
      ],
      'Dynamic Programming': [
        {
          question: "What is the key principle of Dynamic Programming?",
          options: [
            "Divide and conquer only",
            "Storing subproblem solutions",
            "Recursive approach only",
            "Brute force"
          ],
          correct: 1
        },
        {
          question: "What are the two approaches to Dynamic Programming?",
          options: [
            "Top-down and bottom-up",
            "Recursive and iterative",
            "Sequential and parallel",
            "Simple and complex"
          ],
          correct: 0
        },
        {
          question: "What is memoization?",
          options: [
            "Creating a memo",
            "Caching results of subproblems",
            "Writing recursive code",
            "Optimizing space"
          ],
          correct: 1
        },
        {
          question: "Which problem is typically solved by Dynamic Programming?",
          options: [
            "Binary Search",
            "Finding the shortest path",
            "Fibonacci sequence",
            "Sorting"
          ],
          correct: 2
        },
        {
          question: "Dynamic Programming is used when:",
          options: [
            "Problems have no overlapping subproblems",
            "Problems have optimal substructure",
            "Problems cannot be broken down",
            "Problems are random"
          ],
          correct: 1
        }
      ],
      'Greedy Algorithms': [
        {
          question: "What is the approach of Greedy algorithms?",
          options: [
            "Consider all possibilities",
            "Make locally optimal choice",
            "Use dynamic programming",
            "Try all combinations"
          ],
          correct: 1
        },
        {
          question: "Greedy algorithms always find:",
          options: [
            "The global optimum",
            "A locally optimal solution",
            "The best solution always",
            "An approximate solution"
          ],
          correct: 1
        },
        {
          question: "Which is a greedy algorithm?",
          options: [
            "Binary Search",
            "Dijkstra's algorithm",
            "Merge Sort",
            "Binary Tree traversal"
          ],
          correct: 1
        },
        {
          question: "What is the activity selection problem?",
          options: [
            "Finding maximum activities",
            "Selecting maximum non-overlapping intervals",
            "Sorting activities",
            "Counting activities"
          ],
          correct: 1
        },
        {
          question: "Greedy approach is suitable when:",
          options: [
            "Local optimal leads to global optimal",
            "All choices must be considered",
            "Problem has no solution",
            "Problem is NP-complete"
          ],
          correct: 0
        }
      ]
    },
    'Web Development': {
      'HTML Basics': [
        {
          question: "What does HTML stand for?",
          options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyper Transfer Markup Language",
            "Home Tool Markup Language"
          ],
          correct: 0
        },
        {
          question: "Which tag is used for the largest heading?",
          options: ["<heading>", "<h6>", "<h1>", "<head>"],
          correct: 2
        },
        {
          question: "Which attribute specifies the URL in an anchor tag?",
          options: ["link", "href", "src", "url"],
          correct: 1
        },
        {
          question: "What is the correct HTML element for inserting a line break?",
          options: ["<break>", "<lb>", "<br>", "<newline>"],
          correct: 2
        },
        {
          question: "Which HTML attribute is used to define inline styles?",
          options: ["class", "styles", "style", "font"],
          correct: 2
        }
      ],
      'CSS Styling': [
        {
          question: "What does CSS stand for?",
          options: [
            "Creative Style Sheets",
            "Cascading Style Sheets",
            "Computer Style Sheets",
            "Colorful Style Sheets"
          ],
          correct: 1
        },
        {
          question: "Which property is used to change the background color?",
          options: ["color", "bgcolor", "background-color", "background"],
          correct: 2
        },
        {
          question: "How do you select an element with id 'demo'?",
          options: [".demo", "#demo", "demo", "*demo"],
          correct: 1
        },
        {
          question: "Which property controls the text size?",
          options: ["text-style", "font-size", "text-size", "font-style"],
          correct: 1
        },
        {
          question: "How do you make the text bold?",
          options: ["font-weight: bold", "text-style: bold", "font: bold", "style: bold"],
          correct: 0
        }
      ],
      'JavaScript Fundamentals': [
        {
          question: "Which keyword declares a variable that can be reassigned?",
          options: ["const", "let", "var", "Both let and var"],
          correct: 3
        },
        {
          question: "What is the output of typeof null?",
          options: ["null", "undefined", "object", "boolean"],
          correct: 2
        },
        {
          question: "Which method adds an element to the end of an array?",
          options: ["push()", "pop()", "shift()", "unshift()"],
          correct: 0
        },
        {
          question: "What is a closure?",
          options: [
            "A way to close the browser",
            "A function with access to outer scope variables",
            "A method to end loops",
            "An error handling mechanism"
          ],
          correct: 1
        },
        {
          question: "Which is NOT a JavaScript data type?",
          options: ["Number", "Boolean", "Character", "Undefined"],
          correct: 2
        }
      ],
      'React Components': [
        {
          question: "What is a React component?",
          options: [
            "A database",
            "A reusable piece of UI",
            "A CSS file",
            "A server"
          ],
          correct: 1
        },
        {
          question: "What is the purpose of useState hook?",
          options: [
            "To fetch data",
            "To manage component state",
            "To style components",
            "To route pages"
          ],
          correct: 1
        },
        {
          question: "How do you pass data to a child component?",
          options: [
            "Using state",
            "Using props",
            "Using context",
            "Using refs"
          ],
          correct: 1
        },
        {
          question: "What is JSX?",
          options: [
            "A database",
            "JavaScript XML syntax extension",
            "A CSS framework",
            "A testing library"
          ],
          correct: 1
        },
        {
          question: "What lifecycle method runs after component mounts?",
          options: ["componentWillMount", "componentDidMount", "render", "constructor"],
          correct: 1
        }
      ],
      'REST APIs': [
        {
          question: "What does REST stand for?",
          options: [
            "Remote Execution State Transfer",
            "Representational State Transfer",
            "Reliable Server Technology",
            "Resource State Technology"
          ],
          correct: 1
        },
        {
          question: "Which HTTP method is used to update a resource?",
          options: ["GET", "POST", "PUT", "DELETE"],
          correct: 2
        },
        {
          question: "What is a RESTful API?",
          options: [
            "An API that follows REST principles",
            "A fast API",
            "A database API",
            "A frontend API"
          ],
          correct: 0
        },
        {
          question: "What status code indicates successful creation?",
          options: ["200", "201", "204", "301"],
          correct: 1
        },
        {
          question: "What does CRUD stand for?",
          options: [
            "Create, Read, Update, Delete",
            "Connect, Retrieve, Update, Deliver",
            "Create, Render, Upload, Deploy",
            "Complete, Read, Use, Deliver"
          ],
          correct: 0
        }
      ],
      'Authentication & Security': [
        {
          question: "What does JWT stand for?",
          options: [
            "Java Web Token",
            "JSON Web Token",
            "JavaScript Web Transfer",
            "JSON Web Transfer"
          ],
          correct: 1
        },
        {
          question: "What is the purpose of a password hash?",
          options: [
            "To make it readable",
            "To securely store passwords",
            "To encrypt all data",
            "To compress data"
          ],
          correct: 1
        },
        {
          question: "What is XSS?",
          options: [
            "Extra Secure Socket",
            "Cross-Site Scripting",
            "Extended Security Standard",
            "XML Security Schema"
          ],
          correct: 1
        },
        {
          question: "What is CSRF?",
          options: [
            "Cross-Site Request Forgery",
            "Computer Security Response Force",
            "Central Server Request Format",
            "Secure Cookie Storage"
          ],
          correct: 0
        },
        {
          question: "What is HTTPS?",
          options: [
            "Hyper Text Transfer Protocol",
            "Hyper Text Transfer Protocol Secure",
            "High Transfer Protocol",
            "Home Technology Security"
          ],
          correct: 1
        }
      ]
    },
    'Machine Learning': {
      'Introduction to ML': [
        {
          question: "What is Machine Learning?",
          options: [
            "Teaching machines to learn",
            "Programming explicit rules",
            "Building hardware",
            "Creating databases"
          ],
          correct: 0
        },
        {
          question: "What is the difference between AI and ML?",
          options: [
            "They are the same",
            "AI is a subset of ML",
            "ML is a subset of AI",
            "They are unrelated"
          ],
          correct: 2
        },
        {
          question: "What is supervised learning?",
          options: [
            "Learning with labeled data",
            "Learning without any data",
            "Learning with rewards",
            "Learning without supervision"
          ],
          correct: 0
        },
        {
          question: "What is unsupervised learning?",
          options: [
            "Learning with labeled data",
            "Learning with known outcomes",
            "Finding patterns in unlabeled data",
            "Learning with a teacher"
          ],
          correct: 2
        },
        {
          question: "What is overfitting?",
          options: [
            "Model performs well on training and test data",
            "Model memorizes training data",
            "Model is too simple",
            "Model has no parameters"
          ],
          correct: 1
        }
      ],
      'Linear Regression': [
        {
          question: "What is Linear Regression used for?",
          options: [
            "Classification",
            "Predicting continuous values",
            "Clustering",
            "Dimensionality reduction"
          ],
          correct: 1
        },
        {
          question: "In Linear Regression, what does the slope represent?",
          options: [
            "The intercept",
            "Change in Y for unit change in X",
            "The error term",
            "The bias"
          ],
          correct: 1
        },
        {
          question: "What is the cost function in Linear Regression?",
          options: [
            "Mean Absolute Error",
            "Mean Squared Error",
            "Cross Entropy",
            "Accuracy"
          ],
          correct: 1
        },
        {
          question: "What is the goal of Linear Regression?",
          options: [
            "Minimize the cost function",
            "Maximize the cost function",
            "Equalize the cost function",
            "Remove the cost function"
          ],
          correct: 0
        },
        {
          question: "What is R-squared?",
          options: [
            "A probability measure",
            "A measure of model fit",
            "A type of regression",
            "An error measure"
          ],
          correct: 1
        }
      ],
      'Classification': [
        {
          question: "What is classification in ML?",
          options: [
            "Predicting continuous values",
            "Predicting categorical labels",
            "Grouping similar data",
            "Reducing dimensions"
          ],
          correct: 1
        },
        {
          question: "What is a confusion matrix?",
          options: [
            "A matrix of confusion",
            "A table showing correct and incorrect predictions",
            "A type of neural network",
            "A feature selection method"
          ],
          correct: 1
        },
        {
          question: "What is precision?",
          options: [
            "True positives / All positives",
            "True positives / (True positives + False positives)",
            "True negatives / All negatives",
            "Correct predictions / Total predictions"
          ],
          correct: 1
        },
        {
          question: "What is recall?",
          options: [
            "True positives / All positives",
            "True positives / (True positives + False negatives)",
            "True negatives / All negatives",
            "Correct predictions / Total predictions"
          ],
          correct: 1
        },
        {
          question: "Which algorithm is commonly used for classification?",
          options: [
            "Linear Regression",
            "Logistic Regression",
            "K-Means",
            "PCA"
          ],
          correct: 1
        }
      ],
      'Neural Networks': [
        {
          question: "What is a neuron in a neural network?",
          options: [
            "A brain cell",
            "A computational unit that takes inputs and produces output",
            "A type of activation function",
            "A network layer"
          ],
          correct: 1
        },
        {
          question: "What is the activation function?",
          options: [
            "A way to activate the network",
            "A function that determines the output of a neuron",
            "A method to train the network",
            "A type of layer"
          ],
          correct: 1
        },
        {
          question: "What is backpropagation?",
          options: [
            "Forward pass through the network",
            "Algorithm to update weights based on error",
            "A type of activation function",
            "A method to initialize weights"
          ],
          correct: 1
        },
        {
          question: "What is a hidden layer?",
          options: [
            "The input layer",
            "The output layer",
            "A layer between input and output",
            "A layer with no purpose"
          ],
          correct: 2
        },
        {
          question: "What is deep learning?",
          options: [
            "Learning with deep thoughts",
            "Neural networks with multiple hidden layers",
            "Learning with lots of data",
            "Learning with deep memory"
          ],
          correct: 1
        }
      ],
      'Deep Learning': [
        {
          question: "What is a Convolutional Neural Network (CNN) mainly used for?",
          options: [
            "Text processing",
            "Image processing",
            "Sound processing",
            "Time series"
          ],
          correct: 1
        },
        {
          question: "What is pooling in CNN?",
          options: [
            "Combining all features",
            "Reducing spatial dimensions",
            "Adding new layers",
            "Initializing weights"
          ],
          correct: 1
        },
        {
          question: "What is a Recurrent Neural Network (RNN) good for?",
          options: [
            "Image classification",
            "Sequential data",
            "Object detection",
            "Clustering"
          ],
          correct: 1
        },
        {
          question: "What is vanishing gradient problem?",
          options: [
            "Gradients become too large",
            "Gradients become very small, stopping learning",
            "Gradients become zero",
            "Gradients oscillate"
          ],
          correct: 1
        },
        {
          question: "What is transfer learning?",
          options: [
            "Moving data between computers",
            "Using pre-trained models for new tasks",
            "Transferring data between models",
            "Learning to transfer"
          ],
          correct: 1
        }
      ],
      'Natural Language Processing': [
        {
          question: "What is NLP?",
          options: [
            "New Learning Process",
            "Natural Language Processing",
            "Neural Language Programming",
            "Numeric Language Processing"
          ],
          correct: 1
        },
        {
          question: "What is tokenization?",
          options: [
            "Creating tokens for authentication",
            "Breaking text into smaller units",
            "Converting words to numbers",
            "Translating languages"
          ],
          correct: 1
        },
        {
          question: "What is a word embedding?",
          options: [
            "A type of neural network",
            "Representing words as vectors",
            "A text file format",
            "A language model"
          ],
          correct: 1
        },
        {
          question: "What is sentiment analysis?",
          options: [
            "Analyzing emotions in text",
            "Analyzing sentence structure",
            "Analyzing grammar",
            "Analyzing pronunciation"
          ],
          correct: 0
        },
        {
          question: "What is a transformer model?",
          options: [
            "A type of electrical transformer",
            "A neural network architecture using attention",
            "A data transformation tool",
            "A text processing library"
          ],
          correct: 1
        }
      ]
    },
    'Database Systems': {
      'SQL Basics': [
        {
          question: "What does SQL stand for?",
          options: [
            "Structured Query Language",
            "Simple Query Language",
            "Standard Query Language",
            "System Query Language"
          ],
          correct: 0
        },
        {
          question: "Which command is used to retrieve data from a database?",
          options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
          correct: 2
        },
        {
          question: "Which command is used to add new data to a table?",
          options: ["INSERT", "UPDATE", "SELECT", "CREATE"],
          correct: 0
        },
        {
          question: "What is a primary key?",
          options: [
            "The first column in a table",
            "A unique identifier for each record",
            "A foreign key",
            "An index"
          ],
          correct: 1
        },
        {
          question: "Which clause filters rows in SQL?",
          options: ["WHERE", "GROUP BY", "ORDER BY", "HAVING"],
          correct: 0
        }
      ],
      'Database Design': [
        {
          question: "What is normalization?",
          options: [
            "Making data larger",
            "Organizing data to reduce redundancy",
            "Creating more tables",
            "Adding indexes"
          ],
          correct: 1
        },
        {
          question: "What is a foreign key?",
          options: [
            "A key to another database",
            "A column that references another table",
            "The main key in a table",
            "A duplicate key"
          ],
          correct: 1
        },
        {
          question: "What is a schema?",
          options: [
            "A type of database",
            "The structure of a database",
            "A type of index",
            "A backup"
          ],
          correct: 1
        },
        {
          question: "What is the first normal form (1NF)?",
          options: [
            "No repeating groups",
            "No duplicate rows",
            "Both A and B",
            "None of the above"
          ],
          correct: 2
        },
        {
          question: "What is an ER diagram?",
          options: [
            "A type of query",
            "Entity-Relationship diagram",
            "A type of index",
            "A backup method"
          ],
          correct: 1
        }
      ],
      'Joins & Relationships': [
        {
          question: "What does INNER JOIN return?",
          options: [
            "All rows from both tables",
            "Only matching rows from both tables",
            "All rows from left table",
            "All rows from right table"
          ],
          correct: 1
        },
        {
          question: "What does LEFT JOIN return?",
          options: [
            "Only matching rows",
            "All rows from left table and matching from right",
            "All rows from right table",
            "Only non-matching rows"
          ],
          correct: 1
        },
        {
          question: "What is a many-to-many relationship?",
          options: [
            "One record relates to many",
            "Many records relate to many",
            "No relationship",
            "One to one only"
          ],
          correct: 1
        },
        {
          question: "What is a self-join?",
          options: [
            "Joining two different tables",
            "Joining a table with itself",
            "Joining multiple tables",
            "Joining databases"
          ],
          correct: 1
        },
        {
          question: "What is a composite key?",
          options: [
            "A key made of two parts",
            "A key that is composite",
            "A key that is simple",
            "A key that is foreign"
          ],
          correct: 0
        }
      ],
      'Indexing & Optimization': [
        {
          question: "What is a database index?",
          options: [
            "A copy of the database",
            "A data structure for fast lookup",
            "A type of constraint",
            "A backup method"
          ],
          correct: 1
        },
        {
          question: "What is query optimization?",
          options: [
            "Making queries more complex",
            "Selecting the best execution plan",
            "Adding more queries",
            "Optimizing database size"
          ],
          correct: 1
        },
        {
          question: "What is a covering index?",
          options: [
            "An index that covers all columns",
            "An index that contains all data needed by query",
            "An index on all tables",
            "A primary index"
          ],
          correct: 1
        },
        {
          question: "When should indexes be avoided?",
          options: [
            "On frequently queried columns",
            "On columns with high cardinality",
            "On small tables or frequently updated columns",
            "On primary keys"
          ],
          correct: 2
        },
        {
          question: "What is EXPLAIN in SQL?",
          options: [
            "A command to explain data",
            "Shows how query will be executed",
            "A type of join",
            "A constraint"
          ],
          correct: 1
        }
      ],
      'Transactions & ACID': [
        {
          question: "What does ACID stand for?",
          options: [
            "Atomic, Consistent, Isolated, Durable",
            "Active, Complete, Isolated, Durable",
            "Atomic, Complete, Isolated, Distributed",
            "Active, Consistent, Isolated, Durable"
          ],
          correct: 0
        },
        {
          question: "What does Atomicity mean?",
          options: [
            "All transactions run at once",
            "Transaction is all or nothing",
            "Transactions are consistent",
            "Transactions are isolated"
          ],
          correct: 1
        },
        {
          question: "What is a transaction?",
          options: [
            "A single query",
            "A sequence of operations as one unit",
            "A backup process",
            "A user session"
          ],
          correct: 1
        },
        {
          question: "What is isolation in databases?",
          options: [
            "Running transactions separately",
            "Transactions affect each other",
            "No transaction support",
            "Single user mode"
          ],
          correct: 0
        },
        {
          question: "What is durability?",
          options: [
            "Transaction lasts long",
            "Once committed, data persists",
            "Data is always consistent",
            "Transactions are isolated"
          ],
          correct: 1
        }
      ],
      'NoSQL Databases': [
        {
          question: "What is NoSQL?",
          options: [
            "No SQL at all",
            "Not Only SQL",
            "New SQL",
            "No Structured Queries"
          ],
          correct: 1
        },
        {
          question: "What type of data does MongoDB store?",
          options: [
            "Relational data",
            "JSON-like documents",
            "Key-value pairs",
            "Graph data"
          ],
          correct: 1
        },
        {
          question: "What is eventual consistency?",
          options: [
            "Immediate consistency",
            "Consistency after some time",
            "No consistency",
            "Strong consistency"
          ],
          correct: 1
        },
        {
          question: "What is horizontal scaling?",
          options: [
            "Adding more power to existing machine",
            "Adding more machines",
            "Removing machines",
            "Upgrading software"
          ],
          correct: 1
        },
        {
          question: "What is a document database?",
          options: [
            "Stores text files",
            "Stores JSON-like documents",
            "Stores Word documents",
            "Stores PDFs"
          ],
          correct: 1
        }
      ]
    },
    'Operating Systems': {
      'OS Introduction': [
        {
          question: "What is the main purpose of an operating system?",
          options: [
            "Run applications only",
            "Manage hardware resources and provide services",
            "Store files",
            "Connect to internet"
          ],
          correct: 1
        },
        {
          question: "What is kernel?",
          options: [
            "A type of software",
            "The core of the operating system",
            "A user interface",
            "A hardware component"
          ],
          correct: 1
        },
        {
          question: "What is a system call?",
          options: [
            "A user program",
            "Interface between user programs and OS",
            "A function call",
            "A network call"
          ],
          correct: 1
        },
        {
          question: "What is multiprogramming?",
          options: [
            "Running one program at a time",
            "Running multiple programs concurrently",
            "Running programs on multiple computers",
            "Writing multiple programs"
          ],
          correct: 1
        },
        {
          question: "What is a process?",
          options: [
            "A program in execution",
            "A program on disk",
            "A function",
            "A system"
          ],
          correct: 0
        }
      ],
      'Process Management': [
        {
          question: "What is a process control block (PCB)?",
          options: [
            "A hardware block",
            "Data structure storing process information",
            "A memory block",
            "A CPU register"
          ],
          correct: 1
        },
        {
          question: "What is process scheduling?",
          options: [
            "Planning CPU time for processes",
            "Creating new processes",
            "Ending processes",
            "Loading processes"
          ],
          correct: 0
        },
        {
          question: "What is a thread?",
          options: [
            "A heavy process",
            "Lightweight process within a process",
            "A type of operating system",
            "A scheduling algorithm"
          ],
          correct: 1
        },
        {
          question: "What is context switching?",
          options: [
            "Switching between users",
            "Saving and loading process state",
            "Switching between applications",
            "Changing memory"
          ],
          correct: 1
        },
        {
          question: "What is a zombie process?",
          options: [
            "A process that is dead",
            "A terminated process but entry remains",
            "A process that is waiting",
            "A new process"
          ],
          correct: 1
        }
      ],
      'Memory Management': [
        {
          question: "What is virtual memory?",
          options: [
            "Memory on a virtual machine",
            "Using disk as extension of RAM",
            "Memory in the cloud",
            "Physical memory"
          ],
          correct: 1
        },
        {
          question: "What is paging?",
          options: [
            "Loading programs into memory",
            "Dividing memory into fixed-size blocks",
            "Swapping processes",
            "Allocating memory"
          ],
          correct: 1
        },
        {
          question: "What is fragmentation?",
          options: [
            "Memory is broken",
            "Free memory is divided into small blocks",
            "Memory is full",
            "Memory is allocated"
          ],
          correct: 1
        },
        {
          question: "What is external fragmentation?",
          options: [
            "Fragmentation inside memory blocks",
            "Free memory between blocks",
            "Memory loss due to paging",
            "No fragmentation"
          ],
          correct: 1
        },
        {
          question: "What is swapping?",
          options: [
            "Exchanging data between processes",
            "Moving processes between memory and disk",
            "Changing memory addresses",
            "Replacing memory"
          ],
          correct: 1
        }
      ],
      'File Systems': [
        {
          question: "What is a file system?",
          options: [
            "A type of file",
            "Way of organizing files on disk",
            "A storage device",
            "A folder"
          ],
          correct: 1
        },
        {
          question: "What is a directory?",
          options: [
            "A type of file",
            "A folder that contains files",
            "A path",
            "A disk"
          ],
          correct: 1
        },
        {
          question: "What is a inode?",
          options: [
            "A type of file",
            "Data structure storing file metadata",
            "A directory entry",
            "A block of data"
          ],
          correct: 1
        },
        {
          question: "What is file fragmentation?",
          options: [
            "File is broken into pieces stored non-contiguously",
            "File is deleted",
            "File is copied",
            "File is compressed"
          ],
          correct: 0
        },
        {
          question: "What is a mount point?",
          options: [
            "Where a file is stored",
            "Location where file system is attached",
            "A type of file",
            "A backup location"
          ],
          correct: 1
        }
      ],
      'Deadlocks': [
        {
          question: "What is a deadlock?",
          options: [
            "When system stops working",
            "Processes waiting for each other indefinitely",
            "When CPU is overloaded",
            "When memory is full"
          ],
          correct: 1
        },
        {
          question: "What are the necessary conditions for deadlock?",
          options: [
            "One condition only",
            "Mutual exclusion, hold and wait, no preemption, circular wait",
            "Two conditions",
            "No conditions"
          ],
          correct: 1
        },
        {
          question: "What is deadlock prevention?",
          options: [
            "Allowing deadlock to occur and then recover",
            "Ensuring at least one condition cannot hold",
            "Ignoring deadlock",
            "Detecting deadlock"
          ],
          correct: 1
        },
        {
          question: "What is deadlock avoidance?",
          options: [
            "Allowing deadlock to occur",
            "Using algorithms to avoid unsafe states",
            "Ignoring the problem",
            "Killing processes"
          ],
          correct: 1
        },
        {
          question: "What is the Banker's algorithm used for?",
          options: [
            "Bank management",
            "Deadlock avoidance",
            "Memory management",
            "Process scheduling"
          ],
          correct: 1
        }
      ],
      'Virtual Memory': [
        {
          question: "What is virtual memory?",
          options: [
            "Memory on a network",
            "Memory addressing scheme giving illusion of large memory",
            "RAM only",
            "Cache memory"
          ],
          correct: 1
        },
        {
          question: "What is a page fault?",
          options: [
            "Error in paging",
            "When page is not in memory",
            "When memory is full",
            "When page is loaded"
          ],
          correct: 1
        },
        {
          question: "What is the page table?",
          options: [
            "A table of pages",
            "Maps virtual addresses to physical addresses",
            "A list of processes",
            "A type of memory"
          ],
          correct: 1
        },
        {
          question: "What is thrashing?",
          options: [
            "When CPU is fast",
            "Excessive paging causing poor performance",
            "When memory is empty",
            "When processes run fast"
          ],
          correct: 1
        },
        {
          question: "What is a frame in virtual memory?",
          options: [
            "A type of cache",
            "Fixed-size block of physical memory",
            "A page in memory",
            "A segment"
          ],
          correct: 1
        }
      ]
    }
  };

export const getQuizQuestions = (subject, topic) => { if (!subject || !topic) return []; return quizQuestions[subject]?.[topic] || []; };
