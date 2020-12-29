# sss README

This extension provides snippets and formatting for SQL files. It is aimed at SQL Server programmability, so expect support for stored procedures rather than create table.

## Features

This extension provides the following snippets:
|Name|Function|
|----|--------|
|CURSOR|Creates a cursor block from the DECLARE to the DEALLOCATE|
|SELECT|A very simple template for a select statement, which adheres to the opinionated formatting|
|IF|Force using the BEGIN and END keywords without having to type them|


This extension can format the document if it has a SQL extension.


The formatting is opiononted and cannot be tweaked.
- keywords are changed to uppercase
- some keywords are moved to a new line
  - if the statement has a certain length
- variables start with a lowercase letter
- a space is added after a comma
- spaces are added around comparison operators
- comments are ignored

If you enable editor.formatOnType the text will also be formatted whenever a return is entered.

## Known Issues

As this is my first extension it will be buggy. And it may not even be the best way to implement this.
The choice was made to replace the whole file instead of returning incremental TextEdits as per the extension guide.
These incremental changes started to overlap quickly and that caused the formatting to stop.

