# Instagram Graph API - Komentar

## 1. **Get Comments on a Media**

**Endpoint**: `GET /{media-id}/comments`

### Deskripsi:

Mengambil daftar komentar pada sebuah postingan media di Instagram.

### Request:

```http
GET https://graph.facebook.com/{media-id}/comments?access_token={access_token}
```

### Params:

- `access_token (required): Token akses instagram`
- `fields (optional): Kolom yang ingin diambil, misalnya id, text, username, timestamp.`

### Example Request:

```
GET https://graph.facebook.com/18001775357772789/comments?access_token=EAATeceuELSYBOz7GzhYLh1ZCaZADSSwm8oNCYNQzXVaVab2M64FsQfIGZA7nPLZAKwyApICJeTJfZBFzwa7RfLz2gmmbN41IuZBPP0eHgOwXxW97wjfyMDcqBEvS5nSNJ9iJ5GHJfcJy4I8yyA63DhT6WDw5IEMpzaG22pezCGXE8fXOv7THXVwpWZBZBnwyg9cfyonZCr5LU6nXL8PDnvBinZBD67uoCPvoG2j7lZAPZAcvN6Qm

```

### Example Response:

```json
{
  "data": [
    {
      "id": "18001775357772789_18001420488863453",
      "text": "Great post! Looking forward to more.",
      "username": "johndoe",
      "timestamp": "2025-05-08T23:08:47+0000"
    },
    {
      "id": "18001775357772789_18001420488863454",
      "text": "This looks amazing!",
      "username": "janedoe",
      "timestamp": "2025-05-08T23:10:00+0000"
    }
  ]
}
```

## 2. **Post a Comment on a Media**

**Endpoint**: `POST /{media-id}/comments`

### Deskripsi:

Membuat komentar baru pada sebuah postingan media.

### Request:

```http
POST https://graph.facebook.com/{media-id}/comments?access_token={access_token}
```

### Params:

- `access_token (required): Token akses instagram`
- `message (required): esan komentar yang akan diposting.`

### Example Request:

```
POST https://graph.facebook.com/18001775357772789/comments
Content-Type: application/json
{
  "access_token": "EAATeceuELSYBOz7GzhYLh1ZCaZADSSwm8oNCYNQzXVaVab2M64FsQfIGZA7nPLZAKwyApICJeTJfZBFzwa7RfLz2gmmbN41IuZBPP0eHgOwXxW97wjfyMDcqBEvS5nSNJ9iJ5GHJfcJy4I8yyA63DhT6WDw5IEMpzaG22pezCGXE8fXOv7THXVwpWZBZBnwyg9cfyonZCr5LU6nXL8PDnvBinZBD67uoCPvoG2j7lZAPZAcvN6Qm",
  "message": "Awesome content! Keep it up!"
}

```

### Example Response:

```json
{
  "id": "18001775357772789_18001420488863455"
}
```

## 3. **Delete a Comment**

**Endpoint**: `DELETE /{media-id}/comments/{comment-id}`

### Deskripsi:

Menghapus komentar dari sebuah postingan media.

### Request:

```http
DELETE https://graph.facebook.com/{media-id}/comments/{comment-id}
```

### Params:

- `access_token (required): Token akses instagram`

### Example Request:

```
DELETE https://graph.facebook.com/18001775357772789/comments/18001420488863453?access_token=EAATeceuELSYBOz7GzhYLh1ZCaZADSSwm8oNCYNQzXVaVab2M64FsQfIGZA7nPLZAKwyApICJeTJfZBFzwa7RfLz2gmmbN41IuZBPP0eHgOwXxW97wjfyMDcqBEvS5nSNJ9iJ5GHJfcJy4I8yyA63DhT6WDw5IEMpzaG22pezCGXE8fXOv7THXVwpWZBZBnwyg9cfyonZCr5LU6nXL8PDnvBinZBD67uoCPvoG2j7lZAPZAcvN6Qm

```

### Example Response:

```json
{
  "success": true
}
```

## 4. **Get Replies to a Comment**

**Endpoint**: `GET /{comment-id}/replies`

### Deskripsi:

Mengambil daftar balasan terhadap komentar tertentu pada postingan media.

### Request:

```http
GET https://graph.facebook.com/{comment-id}/replies?access_token={access_token}
```

### Params:

- `access_token (required): Token akses instagram`

### Example Request:

```
GET https://graph.facebook.com/18001420488863453/replies?access_token=EAATeceuELSYBOz7GzhYLh1ZCaZADSSwm8oNCYNQzXVaVab2M64FsQfIGZA7nPLZAKwyApICJeTJfZBFzwa7RfLz2gmmbN41IuZBPP0eHgOwXxW97wjfyMDcqBEvS5nSNJ9iJ5GHJfcJy4I8yyA63DhT6WDw5IEMpzaG22pezCGXE8fXOv7THXVwpWZBZBnwyg9cfyonZCr5LU6nXL8PDnvBinZBD67uoCPvoG2j7lZAPZAcvN6Qm

```

### Example Response:

```json
{
  "data": [
    {
      "id": "18001775357772789_18001420488863456",
      "text": "Thanks! We appreciate the feedback.",
      "username": "admin",
      "timestamp": "2025-05-08T23:15:00+0000"
    }
  ]
}
```
