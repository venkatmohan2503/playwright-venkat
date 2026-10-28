// ============================================================
// testData.js
// ALL test data lives here. Tests and page objects read from this file.
// To change a user, product or message -> change it only here.
// ============================================================

// ---------- Application URLs ----------
const urls = {
  login: 'https://rahulshettyacademy.com/client/#/auth/login',
  register: 'https://rahulshettyacademy.com/client/#/auth/register',
  dashboard: 'https://rahulshettyacademy.com/client/#/dashboard/dash',
};

// ---------- 3 fixed users ----------
// Registered ONE time with:  npm run register
// After that, every test logs in with these users.
const registeredUsers = [
  {
    firstName: 'Venkat',
    lastName: 'One',
    email: 'venkat.pw.user1@testmail.com',
    mobile: '9876543210',
    occupation: 'Engineer',
    gender: 'Male',
    password: 'Test@1234',
  },
  {
    firstName: 'Venkat',
    lastName: 'Two',
    email: 'venkat.pw.user2@testmail.com',
    mobile: '9876543211',
    occupation: 'Doctor',
    gender: 'Male',
    password: 'Test@1234',
  },
  {
    firstName: 'Venkat',
    lastName: 'Three',
    email: 'venkat.pw.user3@testmail.com',
    mobile: '9876543212',
    occupation: 'Student',
    gender: 'Male',
    password: 'Test@1234',
  },
];

// ---------- Invalid login data (negative tests) ----------
const invalidUsers = {
  // Correct email, wrong password
  wrongPassword: { email: registeredUsers[0].email, password: 'Wrong@999' },
  // Email that was never registered
  unregistered: { email: 'not.registered.xyz@testmail.com', password: 'Test@1234' },
  // Email with a bad format
  invalidFormat: { email: 'abc@', password: 'Test@1234' },
  // Nothing typed
  empty: { email: '', password: '' },
};

// ---------- Invalid registration values (negative / edge tests) ----------
// Tests copy user 1 and replace ONE field with a value from here.
const invalidRegisterData = {
  badEmail: 'john.test.com',        // no @ sign
  shortPhone: '987654321',          // only 9 digits
  mismatchPassword: 'Other@1234',   // different confirm password
};

// ---------- Products (names exactly as shown on the site) ----------
const products = ['ZARA COAT 3', 'ADIDAS ORIGINAL'];

// Search text that matches no product
const noMatchSearch = 'xyz123';

// ---------- Checkout data ----------
const checkout = {
  countrySearch: 'ind',              // letters typed in the country box
  country: 'India',                  // exact country to pick
  validCoupon: 'rahulshettyacademy', // coupon that works
  invalidCoupon: 'WRONG10',          // coupon that does not work
};

// ---------- Expected messages (assertions) ----------
const messages = {
  // Login / logout
  loginSuccess: 'Login Successfully',
  loginFailed: 'Incorrect email or password.',
  logoutSuccess: 'Logout Successfully',
  emailRequired: '*Email is required',
  passwordRequired: '*Password is required',
  invalidEmail: '*Enter Valid Email',

  // Registration
  registerSuccess: 'Account Created Successfully',
  userAlreadyExists: 'User already exisits with this Email Id!', // spelling is the app's own
  firstNameRequired: '*First Name is required',
  phoneTenDigits: '*Phone Number must be 10 digit',
  passwordMismatch: 'Password and Confirm Password must match with each other.',
  ageCheckboxRequired: '*Please check above checkbox',

  // Products / cart
  productAdded: 'Product Added To Cart',
  cartEmpty: 'No Products in Your Cart !',

  // Checkout / orders
  couponApplied: '* Coupon Applied',
  couponInvalid: '* Invalid Coupon',
  shippingRequired: 'Please Enter Full Shipping Information',
  orderSuccess: 'Thankyou for the order.',
};

// Export everything so tests and page objects can import it
module.exports = {
  urls,
  registeredUsers,
  invalidUsers,
  invalidRegisterData,
  products,
  noMatchSearch,
  checkout,
  messages,
};
