# Operations API

This document provides instructions for calling the operations-related API endpoints.

---

## List Operations

- **METHOD**: `GET`
- **PATH**: `/api/operations`
- **Description**: Retrieves a list of all available operations and their token costs.
- **Auth requirement**: Public
- **Headers**:
  - `Content-Type`: `application/json`
- **Query params**: None
- **Request body**: None
- **Success response sample**:

```json
{
  "success": true,
  "status": 200,
  "message": "Available operations retrieved",
  "data": [
    {
      "id": "clxsehf0a000008l366p1g2g2",
      "name": "text_to_image",
      "tokensPerOperation": 100,
      "description": "Generate an image from a text prompt.",
      "isActive": true,
      "createdAt": "2025-11-01T10:00:00.000Z",
      "updatedAt": "2025-11-01T10:00:00.000Z"
    },
    {
      "id": "clxsehf0a000208l3h3q7b6g4",
      "name": "image_upscale",
      "tokensPerOperation": 200,
      "description": "Upscale image resolution using AI.",
      "isActive": true,
      "createdAt": "2025-11-01T10:00:00.000Z",
      "updatedAt": "2025-11-01T10:00:00.000Z"
    }
  ]
}
```

- **Error responses**:
  - **500 Internal Server Error**: If there is a server-side error.

- **How to call (pseudo)**:

```
GET /api/operations
Content-Type: application/json
```

---

## Get Operation by ID

- **METHOD**: `GET`
- **PATH**: `/api/operations/:id`
- **Description**: Retrieves a single operation by its unique ID.
- **Auth requirement**: Public
- **Headers**:
  - `Content-Type`: `application/json`
- **Path params**:
  - `id` (string, required): The ID of the operation to retrieve.
- **Query params**: None
- **Request body**: None
- **Success response sample**:

```json
{
  "success": true,
  "status": 200,
  "message": "Operation retrieved successfully",
  "data": {
    "id": "clxsehf0a000008l366p1g2g2",
    "name": "text_to_image",
    "tokensPerOperation": 100,
    "description": "Generate an image from a text prompt.",
    "isActive": true,
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T10:00:00.000Z"
  }
}
```

- **Error responses**:
  - **404 Not Found**: If no operation with the specified ID is found.
  - **500 Internal Server Error**: If there is a server-side error.

- **How to call (pseudo)**:

```
GET /api/operations/clxsehf0a000008l366p1g2g2
Content-Type: application/json
```

---

## Create Operation

- **METHOD**: `POST`
- **PATH**: `/api/operations`
- **Description**: Creates a new operation. This is an admin-only endpoint.
- **Auth requirement**: Needs Bearer token (Admin role)
- **Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <access_token>`
- **Request body**:

```json
{
  "name": "image_style_transfer",
  "tokensPerOperation": 150,
  "description": "Apply a style to an image.",
  "isActive": true
}
```

- **Success response sample**:

```json
{
  "success": true,
  "status": 201,
  "message": "Operation created successfully",
  "data": {
    "id": "clxsehf0a000308l3h3q7b6g5",
    "name": "image_style_transfer",
    "tokensPerOperation": 150,
    "description": "Apply a style to an image.",
    "isActive": true,
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T10:00:00.000Z"
  }
}
```

- **Error responses**:
  - **400 Bad Request**: If required fields are missing or invalid.
  - **401 Unauthorized**: If the user is not authenticated or does not have the admin role.
  - **403 Forbidden**: If the user does not have the required permissions.
  - **409 Conflict**: If an operation with the same name already exists.
  - **422 Unprocessable Entity**: If validation fails.
  - **500 Internal Server Error**: If there is a server-side error.

- **How to call (pseudo)**:

```
POST /api/operations
Content-Type: application/json
Authorization: Bearer <admin_access_token>

{
  "name": "image_style_transfer",
  "tokensPerOperation": 150,
  "description": "Apply a style to an image.",
  "isActive": true
}
```

---

## Update Operation

- **METHOD**: `PUT`
- **PATH**: `/api/operations/:id`
- **Description**: Updates an existing operation. This is an admin-only endpoint.
- **Auth requirement**: Needs Bearer token (Admin role)
- **Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <access_token>`
- **Path params**:
  - `id` (string, required): The ID of the operation to update.
- **Request body**:

```json
{
  "tokensPerOperation": 175,
  "description": "Apply a artistic style to an image.",
  "isActive": false
}
```

- **Success response sample**:

```json
{
  "success": true,
  "status": 200,
  "message": "Operation updated successfully",
  "data": {
    "id": "clxsehf0a000308l3h3q7b6g5",
    "name": "image_style_transfer",
    "tokensPerOperation": 175,
    "description": "Apply a artistic style to an image.",
    "isActive": false,
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T11:00:00.000Z"
  }
}
```

- **Error responses**:
  - **400 Bad Request**: If the request body contains invalid data.
  - **401 Unauthorized**: If the user is not authenticated or does not have the admin role.
  - **403 Forbidden**: If the user does not have the required permissions.
  - **404 Not Found**: If no operation with the specified ID is found.
  - **422 Unprocessable Entity**: If validation fails.
  - **500 Internal Server Error**: If there is a server-side error.

- **How to call (pseudo)**:

```
PUT /api/operations/clxsehf0a000308l3h3q7b6g5
Content-Type: application/json
Authorization: Bearer <admin_access_token>

{
  "tokensPerOperation": 175,
  "description": "Apply a artistic style to an image.",
  "isActive": false
}
```

---

## Delete Operation

- **METHOD**: `DELETE`
- **PATH**: `/api/operations/:id`
- **Description**: Deletes an operation. This is an admin-only endpoint.
- **Auth requirement**: Needs Bearer token (Admin role)
- **Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <access_token>`
- **Path params**:
  - `id` (string, required): The ID of the operation to delete.
- **Request body**: None
- **Success response sample**:

```json
{
  "success": true,
  "status": 200,
  "message": "Operation deleted successfully",
  "data": {
    "id": "clxsehf0a000308l3h3q7b6g5"
  }
}
```

- **Error responses**:
  - **401 Unauthorized**: If the user is not authenticated or does not have the admin role.
  - **403 Forbidden**: If the user does not have the required permissions.
  - **404 Not Found**: If no operation with the specified ID is found.
  - **500 Internal Server Error**: If there is a server-side error.

- **How to call (pseudo)**:

```
DELETE /api/operations/clxsehf0a000308l3h3q7b6g5
Content-Type: application/json
Authorization: Bearer <admin_access_token>
```