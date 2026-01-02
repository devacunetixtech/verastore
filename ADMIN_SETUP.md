# Admin Setup Guide

## Creating the First Admin User

VERA'S STORE requires at least one admin user to access the admin dashboard at `/admin`.

### Method 1: Using the Setup Script (Recommended)

1. **Configure Admin Credentials** (Optional)
   
   Add these environment variables to your `.env.local` file:
   ```env
   ADMIN_EMAIL=admin@verastore.com
   ADMIN_PASSWORD=Admin@123456
   ```
   
   If not provided, the script will use the default values above.

2. **Ensure MongoDB is Connected**
   
   Make sure your `MONGODB_URI` is properly configured in `.env.local`:
   ```env
   MONGODB_URI=your_mongodb_connection_string_here
   ```

3. **Run the Setup Script**
   
   ```bash
   npm run setup:admin
   # or
   pnpm setup:admin
   # or
   yarn setup:admin
   ```

4. **Login to Admin Dashboard**
   
   - Go to: `https://your-domain.vercel.app/admin` or `http://localhost:3000/admin`
   - Use the credentials you configured (or the defaults)
   - **Important:** Change your password immediately after first login from the profile page

### Method 2: Manual Database Update

If you prefer manual setup:

1. Register a regular customer account at `/register`
2. Connect to your MongoDB database
3. Find your user in the `users` collection
4. Update the `role` field from `'customer'` to `'admin'`
5. Access the admin dashboard at `/admin`

### Admin Dashboard Features

Once logged in as an admin, you can:

- View sales statistics and recent orders
- Manage products (create, edit, delete)
- Manage categories
- Update order statuses
- View customer information

### Security Notes

- Always use strong, unique passwords for admin accounts
- Change default credentials immediately after setup
- Keep your `NEXTAUTH_SECRET` secure
- Never commit `.env.local` to version control
- Regularly update admin passwords
