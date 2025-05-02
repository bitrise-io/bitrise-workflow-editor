export default `# Example YAML document demonstrating various YAML 1.2 features.
# Scalars
root: "root value"

scalars:
  string_scalar: "Hello, World!"
  integer_scalar: 42
  float_scalar: 3.14159
  boolean_true: true
  boolean_false: false
  null_value: null

# Strings with various styles
string_examples:
  plain_string: "This is a plain string"
  single_quoted_string: 'This is a single quoted string'
  double_quoted_string: "This is a double quoted string"
  multiline_double_quoted_string: >
    This is a multiline
    double quoted string.

# Escaped characters
escaped_string: "Line 1\nLine 2\tTabbed"

# Sequences
sequence_example:
  - apple
  - banana
  - cherry

multi_level_sequence:
  - - item1
    - item2
  - - item3
    - item4

# Mappings
mapping_example:
  key1: value1
  key2: value2
  nested_mapping:
    nested_key1: nested_value1
    nested_key2: nested_value2

# Multi-level mappings
complex_mapping:
  country:
    name: "United States"
    states:
      - name: "California"
        capital: "Sacramento"
      - name: "Texas"
        capital: "Austin"

# Anchors and Aliases
defaults: &defaults
  color: blue
  size: medium

item1:
  <<: *defaults
  type: "T-shirt"

item2:
  <<: *defaults
  type: "Pants"
  size: large

# Tags
tagged_value: !!str "This is a tagged string"

# Inline sequences and mappings
inline_example: {key1: value1, key2: value2}
inline_sequence: [item1, item2, item3]

# Comments
# This is a single line comment.

multi_line_comment: |
  This is a multiline comment
  that goes over multiple lines.

# Complex data types
data_types:
  - id: 1
    is_active: true
    details:
      name: "Example Item"
      tags: [tag1, tag2, tag3]

  - id: 2
    is_active: false
    details:
      name: "Another Item"
      tags: [tag4, tag5]

# 1.2 specific features
version: "1.2"
multiple_scenarios:
  - name: "Scenario 1"
    occur: 0x1A  # Hexadecimal representation
  - name: "Scenario 2"
    occur: 1.0e+2  # Scientific notation

# Various Data
people:
  - name: "Alice"
    age: 30
    active: true
    hobbies: [Reading, Hiking, Cooking]
  - name: "Bob"
    age: 25
    active: false
    hobbies: [Gaming, Writing]
  - name: "Charlie"
    age: 35
    active: true
    hobbies: [Traveling]

# Nested sequences and mappings
complex_structure:
  projects:
    - title: "Project A"
      tasks:
        - title: "Task 1"
          completed: true
        - title: "Task 2"
          completed: false
    - title: "Project B"
      tasks:
        - title: "Task 1"
          completed: true

# More examples
environment:
  production:
    url: "https://example.com"
    db:
      host: "localhost"
      port: 5432
  staging:
    url: "https://staging.example.com"
    db:
      host: "localhost"
      port: 5433

# Dates and Times
event:
  name: "Conference"
  date: 2023-10-15
  time: 10:00:00

# File structure representation
file_system:
  home:
    user: "john"
    directories:
      - name: "Documents"
        size: "20MB"
      - name: "Pictures"
        size: "50MB"
      - name: "Videos"
        size: "100MB"

# Continuation of lines
long_description: >
  A long description that continues
  on the next line and keeps going
  to provide detailed information.

flow_root:
  flow_mapping: {}
  flow_sequence: []

# Final demo entry
final_entry:
  project: "YAML Documentation"
  stages:
    - research: >
        Understanding the basics of YAML,
        looking into version differences.
    - implementation: >
        Writing comprehensive examples
        to showcase YAML features.
    - testing:
        - ensure valid YAML
        - check parsers for compatibility

# Document end
`;
