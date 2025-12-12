# 🔐 Login Credentials - Faculty Performance Evaluation System

## Test Accounts

Use these credentials to log in and access different dashboards:

---

### **1. Zonal Admin Account** 👨‍💼

```
Username: admin
Password: admin123
```

**Redirects to:** `/zonal/dashboard`

**Access:**
- Manage colleges
- QCE account management
- View system-wide statistics
- Academic years management
- Programs management
- System settings

---

### **2. QCE Manager Account** 👩‍💼

```
Username: qce
Password: qce123
```

**Redirects to:** `/qce/dashboard`

**Access:**
- Manage faculty evaluations
- Track evaluation progress
- View faculty programs
- Monitor pending dean evaluations
- Generate evaluation codes

---

### **3. Department Chair Account** 👔

```
Username: chair
Password: chair123
```

**Redirects to:** `/dept-chair/faculty`

**Access:**
- Manage faculty assignments
- Subject offerings management
- Faculty teaching load tracking
- Employment status monitoring
- Schedule management

---

### **4. Faculty Account** 👨‍🏫

```
Username: faculty
Password: faculty123
```

**Redirects to:** `/faculty/subjects`

**Access:**
- View active subjects
- Track evaluation progress
- Monitor student responses
- View evaluation codes
- Check recent evaluators

---

### **5. Student Account** 🎓

```
Username: student
Password: student123
```

**Redirects to:** `/student/evaluations`

**Access:**
- Enter evaluation codes
- View pending evaluations
- Complete faculty evaluations
- Track completed evaluations

---

## 🚀 How to Use

1. **Navigate to the login page:**
   ```
   http://localhost:3001/login
   ```

2. **Enter credentials** from the list above

3. **Click "Sign In"**

4. **You'll be automatically redirected** to the appropriate dashboard based on your role

---

## 📋 Quick Reference Table

| Role | Username | Password | Dashboard URL |
|------|----------|----------|---------------|
| **Zonal Admin** | `admin` | `admin123` | `/zonal/dashboard` |
| **QCE Manager** | `qce` | `qce123` | `/qce/dashboard` |
| **Dept. Chair** | `chair` | `chair123` | `/dept-chair/faculty` |
| **Faculty** | `faculty` | `faculty123` | `/faculty/subjects` |
| **Student** | `student` | `student123` | `/student/evaluations` |

---

## 🔒 Authentication Features

- ✅ **Role-based authentication** - Each user is redirected to their specific dashboard
- ✅ **Form validation** - Username and password are required
- ✅ **Error handling** - Shows specific error messages for invalid credentials
- ✅ **Case-insensitive usernames** - You can type "ADMIN" or "admin"
- ✅ **Session storage** - User role and username are stored in localStorage

---

## 🧪 Testing Different Roles

To test different dashboards:

1. **Log out** (or clear localStorage)
2. **Go back to login page**
3. **Use different credentials** from the table above
4. **Explore the role-specific dashboard**

---

## 💡 Tips

- **Usernames are case-insensitive** - "admin", "ADMIN", "Admin" all work
- **Passwords are case-sensitive** - Must match exactly
- **Invalid credentials** will show an error message
- **Each role has a different sidebar menu** with role-specific navigation

---

## 🔄 Logout

Currently, there's no logout button implemented. To switch accounts:

1. **Open browser console** (F12)
2. **Run:** `localStorage.clear()`
3. **Refresh the page**
4. **Log in with different credentials**

Or simply navigate back to `/login` and enter new credentials.

---

## 🎯 Example Login Flow

### Example 1: Login as Student

1. Go to `http://localhost:3001/login`
2. Enter:
   - Username: `student`
   - Password: `student123`
3. Click "Sign In"
4. ✅ Redirected to `/student/evaluations`
5. See student dashboard with evaluation code input

### Example 2: Login as Faculty

1. Go to `http://localhost:3001/login`
2. Enter:
   - Username: `faculty`
   - Password: `faculty123`
3. Click "Sign In"
4. ✅ Redirected to `/faculty/subjects`
5. See faculty dashboard with subject tracking

---

## 📝 Notes

- This is a **mock authentication system** for demonstration purposes
- In production, you would connect to a real backend API
- Passwords should be hashed and stored securely
- Consider implementing JWT tokens for session management
- Add logout functionality in the header

---

**All credentials are ready to use! Start testing the dashboards now!** 🎉
