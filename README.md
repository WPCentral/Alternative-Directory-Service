# Alternative-Directory
A node.js service that pulls all plugins/themes information into a database

## Goal ##
The goal of this project is to build a service that retrieves all information from WordPress.org plugins/themes into our own database. And from there generate even more.
The goal isn't to build a trully alternative system that can be hooked into WordPress itself. But there should be public APIs that can be used by others to do so.

## Data storage ##
MySQL is the leading database where some information will be stored like plugin name and the queue. Most information however will be stored in Elasticsearch where WordPress also can access it directly.
