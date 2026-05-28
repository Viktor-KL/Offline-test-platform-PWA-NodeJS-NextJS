-- Update test titles and descriptions to English
UPDATE tests SET title = 'JavaScript Fundamentals', description = 'Core JS concepts: types, functions, async, and modern syntax' WHERE id = 1;
UPDATE tests SET title = 'React & Next.js', description = 'Components, hooks, App Router, and Next.js features' WHERE id = 2;
UPDATE tests SET title = 'TypeScript Essentials', description = 'Types, interfaces, generics, and TypeScript best practices' WHERE id = 3;

-- Replace all questions with English versions
DELETE FROM questions WHERE test_id IN (1, 2, 3);

-- JavaScript Fundamentals (test_id = 1)
INSERT INTO questions (test_id, text, options, correct_answer) VALUES
(1, 'What does typeof null return?',
 '["object", "null", "undefined", "boolean"]',
 'object'),

(1, 'What does console.log(0.1 + 0.2 === 0.3) output?',
 '["true", "false", "NaN", "RangeError"]',
 'false'),

(1, 'Which array method does NOT mutate the original array?',
 '["push()", "splice()", "map()", "sort()"]',
 'map()'),

(1, 'What is a closure in JavaScript?',
 '["A function that remembers its lexical environment", "A method to close a module", "A way to declare private variables", "The Singleton design pattern"]',
 'A function that remembers its lexical environment'),

(1, 'What does typeof [] return?',
 '["array", "object", "undefined", "null"]',
 'object'),

(1, 'Which operator performs strict equality without type coercion?',
 '["==", "===", "=", "!="]',
 '==='),

(1, 'What is the Event Loop?',
 '["A mechanism for handling async tasks in JS", "A for...of loop for events", "A type of callback", "A built-in timer"]',
 'A mechanism for handling async tasks in JS'),

(1, 'What is the difference between let and var?',
 '["let has block scope, var has function scope", "let cannot be reassigned", "var does not get hoisted", "There is no difference"]',
 'let has block scope, var has function scope'),

(1, 'What is a Promise?',
 '["An object representing the result of an async operation", "A type of function", "A way to store data", "An array method"]',
 'An object representing the result of an async operation'),

(1, 'What does the spread operator (...) do?',
 '["Expands an iterable into individual elements", "Declares a function", "Creates a deep copy", "Removes an element from an array"]',
 'Expands an iterable into individual elements');


-- React & Next.js (test_id = 2)
INSERT INTO questions (test_id, text, options, correct_answer) VALUES
(2, 'What is JSX?',
 '["A syntax extension for JS to describe UI", "A separate programming language", "A styling library", "A compiler"]',
 'A syntax extension for JS to describe UI'),

(2, 'What is the purpose of useState?',
 '["Managing local component state", "Making HTTP requests", "Handling routing", "Optimizing renders"]',
 'Managing local component state'),

(2, 'What happens when state changes in React?',
 '["The component re-renders", "The page reloads", "The URL changes", "Nothing happens"]',
 'The component re-renders'),

(2, 'Which hook is used for side effects?',
 '["useState", "useEffect", "useContext", "useRef"]',
 'useEffect'),

(2, 'What are props in React?',
 '["Data passed from parent to child component", "Internal component state", "Lifecycle methods", "CSS styles"]',
 'Data passed from parent to child component'),

(2, 'Why is the key attribute important when rendering lists?',
 '["Uniquely identifies elements for efficient DOM updates", "Applies styles to elements", "Provides data access", "Required HTML attribute"]',
 'Uniquely identifies elements for efficient DOM updates'),

(2, 'What is App Router in Next.js?',
 '["File-based routing using the app/ directory", "A separate routing library", "A navigation component", "Request middleware"]',
 'File-based routing using the app/ directory'),

(2, 'Which directive marks a component as client-side in Next.js?',
 '["use server", "use client", "use strict", "client only"]',
 'use client'),

(2, 'What is the Virtual DOM?',
 '["An in-memory representation of the real DOM", "A separate browser engine", "A way to store styles", "A testing tool"]',
 'An in-memory representation of the real DOM'),

(2, 'What is the purpose of useCallback?',
 '["Memoizing functions to prevent unnecessary re-renders", "Making API calls", "Working with forms", "Creating context"]',
 'Memoizing functions to prevent unnecessary re-renders');


-- TypeScript Essentials (test_id = 3)
INSERT INTO questions (test_id, text, options, correct_answer) VALUES
(3, 'What is TypeScript?',
 '["A typed superset of JavaScript", "A separate programming language", "A Node.js framework", "A testing library"]',
 'A typed superset of JavaScript'),

(3, 'How do you declare a variable with a string type?',
 '["let name = string;", "let name: string;", "string name;", "var name as string;"]',
 'let name: string;'),

(3, 'What is an interface in TypeScript?',
 '["A description of the shape of an object", "A class without implementation", "A function type", "A way to import modules"]',
 'A description of the shape of an object'),

(3, 'Which type means a value can be anything?',
 '["unknown", "any", "void", "never"]',
 'any'),

(3, 'How do you mark an interface property as optional?',
 '["name!: string", "name?: string", "name: string | undefined", "optional name: string"]',
 'name?: string'),

(3, 'What is a union type?',
 '["A type that can be one of several types", "Merging two interfaces", "A type for arrays", "A way to inherit classes"]',
 'A type that can be one of several types'),

(3, 'What does the void type mean?',
 '["A function returns no value", "An empty object", "An unknown type", "A null value"]',
 'A function returns no value'),

(3, 'How do you define a type for an array of strings?',
 '["Array(string)", "string[]", "[]string", "array<string>"]',
 'string[]'),

(3, 'What are generics in TypeScript?',
 '["Parameterized types for creating reusable components", "Global variables", "Primitive data types", "Built-in methods"]',
 'Parameterized types for creating reusable components'),

(3, 'What is the main difference between type and interface?',
 '["type supports union/intersection, interface is better for OOP and extends", "type cannot be extended", "interface supports primitives, type does not", "No difference, they are fully interchangeable"]',
 'type supports union/intersection, interface is better for OOP and extends');
