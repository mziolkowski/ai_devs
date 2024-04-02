export const taskShema = {
    "name": "addUser",
    "description": "Add user",
    "parameters": {
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "username"
            },
            "surname": {
                "type": "string",
                "description": "surname"
            },
            "year": {
                "type": "integer",
                "description": "Year of birthday"
            }
        },
        "require": [
            "name", "surname", "year"
        ]
    }
}