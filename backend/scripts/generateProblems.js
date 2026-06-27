const fs = require('fs');
const topics = {
  "Arrays": [
    { title: "Maximum Sum of {k} Elements", desc: "Find the maximum sum of {k} consecutive elements in an array representing {context}." },
    { title: "Best Time to Trade {item}", desc: "Given an array of {item} prices, find the maximum profit you can achieve." },
    { title: "First Missing {item}", desc: "Find the first missing positive integer in a list of {context}." },
    { title: "Rotate {context}", desc: "Rotate the array of {item} to the right by {k} steps." },
    { title: "Find Peak {item}", desc: "A peak element is an element strictly greater than its neighbors. Given an integer array representing {context}, find a peak element." },
    { title: "Merge Overlapping {context}", desc: "Given an array of intervals representing {context}, merge all overlapping intervals." },
    { title: "Subarray Sum Equals {k}", desc: "Given an array of integers representing {context}, return the total number of continuous subarrays whose sum equals to {k}." },
    { title: "Product of Array Except Self", desc: "Given an integer array representing {context}, return an array answer such that answer[i] is equal to the product of all the elements except nums[i]." },
    { title: "Longest Consecutive Sequence", desc: "Given an unsorted array of integers representing {context}, return the length of the longest consecutive elements sequence." },
    { title: "Search in Rotated Sorted {context}", desc: "Given the array nums representing {context} after rotation, return the index of target." }
  ],
  "Trees": [
    { title: "Validate {context} Tree", desc: "Given the root of a binary tree representing {context}, determine if it is a valid binary search tree (BST)." },
    { title: "Lowest Common Ancestor of {context}", desc: "Given a binary tree representing {context}, find the lowest common ancestor (LCA)." },
    { title: "Binary Tree Level Order Traversal", desc: "Given the root of a binary tree representing {context}, return the level order traversal." },
    { title: "Maximum Depth of {context}", desc: "Given the root of a binary tree representing {context}, return its maximum depth." },
    { title: "Symmetric {context} Tree", desc: "Given the root of a binary tree representing {context}, check whether it is a mirror of itself." },
    { title: "Invert {context} Tree", desc: "Given the root of a binary tree representing {context}, invert the tree." },
    { title: "Path Sum for {context}", desc: "Given the root of a binary tree representing {context}, return true if the tree has a root-to-leaf path equal to targetSum." },
    { title: "Construct Binary Tree from Traversals", desc: "Given two integer arrays preorder and inorder representing {context}, construct the binary tree." },
    { title: "Flatten {context} Tree to Linked List", desc: "Given the root of a binary tree representing {context}, flatten the tree into a linked list in-place." },
    { title: "Diameter of {context} Tree", desc: "Given the root of a binary tree representing {context}, return the length of the diameter." }
  ],
  "Linked Lists": [
    { title: "Reverse {context} List", desc: "Given the head of a singly linked list representing {context}, reverse the list." },
    { title: "Merge {k} Sorted {context} Lists", desc: "You are given an array of k linked-lists representing {context}. Merge all the linked-lists into one sorted linked-list." },
    { title: "Detect Cycle in {context} List", desc: "Given head, the head of a linked list representing {context}, determine if the linked list has a cycle in it." },
    { title: "Remove Nth Node from End", desc: "Given the head of a linked list representing {context}, remove the nth node from the end." },
    { title: "Intersection of Two {context} Lists", desc: "Given the heads of two singly linked-lists representing {context}, return the intersecting node." },
    { title: "Palindrome {context} List", desc: "Given the head of a singly linked list representing {context}, return true if it is a palindrome." },
    { title: "Swap Nodes in Pairs", desc: "Given a linked list representing {context}, swap every two adjacent nodes." },
    { title: "Copy List with Random Pointer", desc: "A linked list representing {context} is given. Return a deep copy." },
    { title: "Sort {context} List", desc: "Given the head of a linked list representing {context}, sort it in ascending order." },
    { title: "Reorder {context} List", desc: "You are given the head of a singly linked-list representing {context}. Reorder the list." }
  ],
  "Dynamic Programming": [
    { title: "Climbing {context} Stairs", desc: "You are climbing a staircase in {context}. It takes n steps to reach the top. In how many distinct ways can you climb to the top?" },
    { title: "Coin Change for {item}", desc: "You are given an array coins representing {item} of different denominations. Return the fewest number of coins to make up that amount." },
    { title: "Longest Increasing Subsequence of {item}", desc: "Given an integer array nums representing {context}, return the length of the longest strictly increasing subsequence." },
    { title: "Maximum Subarray in {context}", desc: "Given an integer array nums representing {context}, find the subarray with the largest sum." },
    { title: "House Robber in {context}", desc: "You are a professional robber planning to rob houses along a street representing {context}. Determine the maximum amount of money you can rob." },
    { title: "Word Break for {item}", desc: "Given a string s and a dictionary of strings representing {item}, return true if s can be segmented." },
    { title: "Decode Ways of {context}", desc: "A message containing letters can be encoded. Given a string representing {context}, return the number of ways to decode it." },
    { title: "Unique Paths in {context}", desc: "There is a robot on an m x n grid representing {context}. How many possible unique paths are there?" },
    { title: "Edit Distance of {item}", desc: "Given two strings representing {item}, return the minimum number of operations required to convert them." },
    { title: "Regular Expression Matching", desc: "Given an input string and a pattern representing {context}, implement regular expression matching." }
  ],
  "Graphs": [
    { title: "Number of {item} Islands", desc: "Given an m x n 2D binary grid grid representing a map of {context}, return the number of islands." },
    { title: "Clone {context} Graph", desc: "Given a reference of a node in a connected undirected graph representing {context}, return a deep copy (clone) of the graph." },
    { title: "Course Schedule for {context}", desc: "There are a total of numCourses courses you have to take representing {context}. Return true if you can finish all courses." },
    { title: "Network Delay Time in {context}", desc: "You are given a network of n nodes representing {context}. Return the time it takes for all nodes to receive the signal." },
    { title: "Word Ladder for {item}", desc: "A transformation sequence from word beginWord to endWord using a dictionary wordList representing {item}. Return the length of the shortest transformation sequence." }
  ],
  "Strings": [
    { title: "Longest Substring Without Repeating {item}", desc: "Given a string s representing {context}, find the length of the longest substring without repeating characters." },
    { title: "Valid Anagram of {item}", desc: "Given two strings s and t representing {item}, return true if t is an anagram of s, and false otherwise." },
    { title: "Group Anagrams of {context}", desc: "Given an array of strings strs representing {context}, group the anagrams together. You can return the answer in any order." },
    { title: "Longest Palindromic Substring in {context}", desc: "Given a string s representing {context}, return the longest palindromic substring in s." },
    { title: "Generate Parentheses for {context}", desc: "Given n pairs of parentheses representing {context}, write a function to generate all combinations of well-formed parentheses." }
  ],
  "Two Pointers": [
    { title: "Valid Palindrome in {context}", desc: "Given a string s representing {context}, return true if it is a palindrome, or false otherwise." },
    { title: "3Sum of {item}", desc: "Given an integer array nums representing {item}, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0." },
    { title: "Container With Most {item}", desc: "You are given an integer array height of length n representing {context}. Find two lines that together with the x-axis form a container, such that the container contains the most water." },
    { title: "Trapping Rain Water in {context}", desc: "Given n non-negative integers representing an elevation map of {context} where the width of each bar is 1, compute how much water it can trap after raining." },
    { title: "Two Sum II - Input Array Is Sorted", desc: "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order representing {context}, find two numbers such that they add up to a specific target number." }
  ],
  "Binary Search": [
    { title: "Binary Search in {context}", desc: "Given an array of integers nums which is sorted in ascending order representing {context}, and an integer target, write a function to search target in nums." },
    { title: "Search a 2D Matrix of {item}", desc: "Write an efficient algorithm that searches for a value in an m x n matrix representing {context}. This matrix has the following properties: Integers in each row are sorted from left to right." },
    { title: "Koko Eating {item}", desc: "Koko loves to eat {item}. There are n piles of {item}, the ith pile has piles[i] {item}. Return the minimum integer k such that she can eat all the {item} within h hours." },
    { title: "Find Minimum in Rotated Sorted {context}", desc: "Suppose an array of length n sorted in ascending order is rotated between 1 and n times representing {context}. Return the minimum element of this array." },
    { title: "Search in Rotated Sorted {item}", desc: "There is an integer array nums sorted in ascending order (with distinct values) representing {context}. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums." }
  ],
  "Stack": [
    { title: "Valid Parentheses in {context}", desc: "Given a string s representing {context} containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid." },
    { title: "Min Stack for {item}", desc: "Design a stack that supports push, pop, top, and retrieving the minimum {item} in constant time." },
    { title: "Evaluate Reverse Polish Notation of {context}", desc: "Evaluate the value of an arithmetic expression in Reverse Polish Notation representing {context}." },
    { title: "Generate Parentheses", desc: "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses." },
    { title: "Daily Temperatures", desc: "Given an array of integers temperatures representing {context}, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature." }
  ],
  "Queue": [
    { title: "Implement Queue using Stacks", desc: "Implement a first in first out (FIFO) queue using only two stacks." },
    { title: "Design Circular Queue", desc: "Design your implementation of the circular queue representing {context}." },
    { title: "Number of Recent Calls", desc: "You have a RecentCounter class which counts the number of recent {item} within a certain time frame." },
    { title: "Design Hit Counter", desc: "Design a hit counter which counts the number of {item} received in the past 5 minutes." },
    { title: "Moving Average from Data Stream", desc: "Given a stream of integers representing {context} and a window size, calculate the moving average of all integers in the sliding window." }
  ],
  "Heap": [
    { title: "Kth Largest Element in an Array", desc: "Given an integer array nums representing {context} and an integer k, return the kth largest element in the array." },
    { title: "Top K Frequent {item}", desc: "Given an integer array nums representing {context} and an integer k, return the k most frequent elements." },
    { title: "Find Median from Data Stream", desc: "The median is the middle value in an ordered integer list representing {context}. Implement the MedianFinder class." },
    { title: "Merge k Sorted Lists", desc: "You are given an array of k linked-lists representing {context}, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it." },
    { title: "Task Scheduler", desc: "Given a characters array tasks, representing the tasks a CPU needs to do, where each letter represents a different {item}, find the least number of units of times that the CPU will take to finish all the given tasks." }
  ],
  "Greedy": [
    { title: "Jump Game", desc: "You are given an integer array nums representing {context}. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise." },
    { title: "Gas Station", desc: "There are n gas stations along a circular route representing {context}, where the amount of gas at the ith station is gas[i]. Return the starting gas station's index if you can travel around the circuit once in the clockwise direction, otherwise return -1." },
    { title: "Hand of Straights", desc: "Alice has some cards representing {context}. She wants to rearrange the cards into groups so that each group is of size groupSize, and consists of groupSize consecutive cards. Return true if she can do it, or false otherwise." },
    { title: "Merge Triplets to Form Target Triplet", desc: "A triplet is an array of three integers. You are given a 2D integer array triplets representing {context} and an integer array target. Return true if we can obtain the target triplet, or false otherwise." },
    { title: "Partition Labels", desc: "You are given a string s representing {context}. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts." }
  ],
  "Backtracking": [
    { title: "Subsets of {item}", desc: "Given an integer array nums of unique elements representing {context}, return all possible subsets (the power set)." },
    { title: "Combination Sum", desc: "Given an array of distinct integers candidates representing {context} and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target." },
    { title: "Permutations of {item}", desc: "Given an array nums of distinct integers representing {context}, return all the possible permutations. You can return the answer in any order." },
    { title: "Word Search", desc: "Given an m x n grid of characters board representing {context} and a string word, return true if word exists in the grid." },
    { title: "N-Queens", desc: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard representing {context} such that no two queens attack each other. Return all distinct solutions to the n-queens puzzle." }
  ],
  "Bit Manipulation": [
    { title: "Single Number in {context}", desc: "Given a non-empty array of integers nums representing {context}, every element appears twice except for one. Find that single one." },
    { title: "Number of 1 Bits", desc: "Write a function that takes an unsigned integer representing {context} and returns the number of '1' bits it has (also known as the Hamming weight)." },
    { title: "Counting Bits", desc: "Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i." },
    { title: "Reverse Bits", desc: "Reverse bits of a given 32 bits unsigned integer representing {context}." },
    { title: "Missing Number in {context}", desc: "Given an array nums containing n distinct numbers in the range [0, n] representing {context}, return the only number in the range that is missing from the array." }
  ],
  "Trie": [
    { title: "Implement Trie (Prefix Tree)", desc: "A trie or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings representing {context}. Implement the Trie class." },
    { title: "Design Add and Search Words Data Structure", desc: "Design a data structure that supports adding new words representing {context} and finding if a string matches any previously added string." },
    { title: "Word Search II", desc: "Given an m x n board of characters and a list of strings words representing {context}, return all words on the board." },
    { title: "Maximum XOR of Two Numbers in an Array", desc: "Given an integer array nums representing {context}, return the maximum result of nums[i] XOR nums[j], where 0 <= i <= j < n." },
    { title: "Palindrome Pairs", desc: "Given a list of unique words representing {context}, return all the pairs of the distinct indices (i, j) in the given list, so that the concatenation of the two words words[i] + words[j] is a palindrome." }
  ],
  "Matrix": [
    { title: "Set Matrix Zeroes", desc: "Given an m x n integer matrix matrix representing {context}, if an element is 0, set its entire row and column to 0's." },
    { title: "Spiral Matrix", desc: "Given an m x n matrix representing {context}, return all elements of the matrix in spiral order." },
    { title: "Rotate Image", desc: "You are given an n x n 2D matrix representing an image of {context}, rotate the image by 90 degrees (clockwise)." },
    { title: "Word Search", desc: "Given an m x n grid of characters board representing {context} and a string word, return true if word exists in the grid." },
    { title: "Valid Sudoku", desc: "Determine if a 9 x 9 Sudoku board representing {context} is valid. Only the filled cells need to be validated according to the following rules: Each row must contain the digits 1-9 without repetition. Each column must contain the digits 1-9 without repetition. Each of the nine 3 x 3 sub-boxes of the grid must contain the digits 1-9 without repetition." }
  ]
};
const contexts = [
  { context: "sensor readings", item: "temperature data" },
  { context: "stock market trends", item: "stocks" },
  { context: "student test scores", item: "scores" },
  { context: "daily rainfall", item: "precipitation" },
  { context: "server response times", item: "latencies" },
  { context: "user clicks", item: "clicks" },
  { context: "shopping cart prices", item: "products" },
  { context: "network packets", item: "packets" },
  { context: "inventory counts", item: "items" },
  { context: "website traffic", item: "visitors" },
  { context: "CPU usage", item: "processes" },
  { context: "game high scores", item: "players" }
];
const difficulties = ["Easy", "Medium", "Hard"];
let output = [];
for (const [topic, templates] of Object.entries(topics)) {
  for (const template of templates) {
    for (const ctx of contexts) {
      let k = Math.floor(Math.random() * 10) + 2;
      let title = template.title.replace('{context}', ctx.context).replace('{item}', ctx.item).replace('{k}', k);
      let desc = template.desc.replace('{context}', ctx.context).replace('{item}', ctx.item).replace('{k}', k);
      let markdownDesc = `${desc}

### Example 1:
**Input:** Random typical input
**Output:** Expected output

### Constraints:
- \`1 <= length <= 10^5\`
- \`-10^9 <= value <= 10^9\`
`;
      output.push({ title: title, topic: topic, difficulty: difficulties[Math.floor(Math.random() * difficulties.length)], description: markdownDesc });
    }
  }
}
fs.writeFileSync('./data/problems.json', JSON.stringify(output, null, 2));
console.log(`Successfully generated ${output.length} problems!`);
