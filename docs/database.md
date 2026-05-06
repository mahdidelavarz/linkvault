3.1 List entities

    User
    Link
    Note
    File
    Category
    Tag
    Taggable

3.2 Define relationships (text-first)

Example:

                                                                    md
User 1─* Link
User 1─* Note
User 1─* Category
Category 1─* Category (self reference)
Tag *─* (Link | Note | File)