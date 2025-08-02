# Creator Content Delivery Platform

A secure platform for delivering exclusive media content to customers from OnlyFans-style creators. Built with Next.js, MongoDB, and Cloudinary.

## Features

- 🔒 Password-protected creator pages
- 📱 Mobile-optimized media viewing experience
- 🎥 Support for images and videos
- 🔄 Infinite scroll content loading
- ⚡ Fast and responsive UI
- 👩‍💼 Easy creator management
- 🎯 Time-bound or single-use access

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Media Storage**: Cloudinary
- **Styling**: Tailwind CSS
- **Authentication**: Password-based with bcrypt

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- MongoDB instance (local or hosted)
- Cloudinary account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/creator-content-platform.git
   cd creator-content-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/creator-content

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_NOTIFICATION_URL=https://your-domain.com/api/cloudinary/webhook

   # Security
   ADMIN_TOKEN=your-secure-admin-token
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Guide

### Adding a New Creator

1. Access the admin panel at `/admin` using your `ADMIN_TOKEN`
2. Click "Add Creator"
3. Fill in the creator's details:
   - Name
   - Bio (optional)
   - Slug (auto-generated but can be customized)

### Uploading Content

1. Navigate to the creator's management page
2. Use the upload form to add images or videos
3. Content will be automatically processed and optimized by Cloudinary

### Managing Access

1. Generate a new password for a creator's content
2. Configure password settings:
   - Single-use or multi-use
   - Expiration date (optional)
   - Maximum usage count (optional)
3. Share the password with the customer

## Security Considerations

- All passwords are hashed using bcrypt
- Media files are securely stored in Cloudinary
- Access tokens are stored in HTTP-only cookies
- Rate limiting is implemented on password attempts
- Admin routes are protected with token authentication

## API Documentation

### Creator Endpoints

- `GET /api/creators`: List all creators
- `GET /api/creators/[slug]`: Get creator details
- `POST /api/creators`: Create a new creator
- `PUT /api/creators/[slug]`: Update creator details
- `DELETE /api/creators/[slug]`: Delete a creator

### Media Endpoints

- `GET /api/media/[creatorId]`: Get creator's media
- `POST /api/media/upload`: Upload new media
- `DELETE /api/media/[id]`: Delete media

### Password Endpoints

- `POST /api/passwords/create`: Generate new access password
- `POST /api/passwords/validate`: Validate password attempt
- `GET /api/passwords/[creatorId]`: List active passwords

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
