# Test Plan — Rahul Shetty Academy Shopping App

App: https://rahulshettyacademy.com/client/#/auth/login

## Scenarios

### Registration — `tests/register.spec.js`
| ID | Type | Title | Steps | Expected result |
|---|---|---|---|---|
| R01 | Positive | Register 3 users (looped over the dataset, run once) | Open Register → fill all fields → tick age box → Register | "Account Created Successfully" |
| R02 | Negative | Email that already exists | Register user 1 again | Toast "User already exisits with this Email Id!", stays on Register |
| R03 | Negative | Empty form | Click Register | "*First Name is required", "*Email is required" |
| R04 | Negative | Invalid email format | Email = `john.test.com` | "*Enter Valid Email" |
| R05 | Edge | 9-digit phone | Mobile = `987654321` | "*Phone Number must be 10 digit" |
| R06 | Negative | Passwords don't match | Confirm password differs | Password-mismatch error |
| R07 | Edge | Age box not ticked | Fill all, skip the checkbox | "*Please check above checkbox" |

### Login and logout — `tests/login.spec.js`
| ID | Type | Title | Steps | Expected result |
|---|---|---|---|---|
| L01 | Positive | Valid login (looped over the 3 users) | Email + password → Login | Toast "Login Successfully", dashboard URL, products visible |
| L02 | Negative | Wrong password | Registered email + wrong password | Toast "Incorrect email or password.", stays on Login |
| L03 | Negative | Unregistered email | Unknown email | Toast "Incorrect email or password." |
| L04 | Negative | Empty fields | Click Login | "*Email is required", "*Password is required" |
| L05 | Edge | Invalid email format | Email = `abc@` | "*Enter Valid Email" |
| L06 | Positive | Logout | Login → Sign Out | Toast "Logout Successfully", Login page shown |

### Products and cart — `tests/products.spec.js`, `tests/cart.spec.js`
| ID | Type | Title | Steps | Expected result |
|---|---|---|---|---|
| P01 | Positive | Products listed | Login | At least 1 product card |
| P02 | Positive | Search for a product | Search "ZARA COAT 3" | Only that product shown |
| P03 | Edge | Search with no match | Search "xyz123" | 0 products |
| C01 | Positive | Add one product | Add ZARA COAT 3 | Toast "Product Added To Cart", product in cart |
| C02 | Positive | Add two products | Add both dataset products | Both listed in cart |
| C03 | Positive | Remove a product | Add → cart → delete | "No Products in Your Cart !" |

### Checkout and orders — `tests/checkout.spec.js`, `tests/e2eOrder.spec.js`
| ID | Type | Title | Steps | Expected result |
|---|---|---|---|---|
| O01 | Positive (E2E) | Place an order (looped over the 3 users) | Login → clear cart → add products → cart → Checkout → verify email → pick India → Place Order | "Thankyou for the order.", order ID shown |
| O02 | Positive | Valid coupon | Apply `rahulshettyacademy` | "* Coupon Applied" |
| O03 | Negative | Invalid coupon | Apply `WRONG10` | "* Invalid Coupon" |
| O04 | Negative | No country | Place Order without a country | Toast "Please Enter Full Shipping Information", stays on checkout |
| O05 | Edge | Similar country names | Type "ind" → pick exactly "India" | Country box = "India" |
| H01 | Positive | Order history and details | Orders → find order ID → View | Order is listed; details show the same ID |

## Flakiness risks and simple fixes
1. **Toasts disappear after a few seconds**: assert at once with `expect(toast).toContainText()`, which retries by itself.
2. **Products load after the page appears**: `verifyPageLoaded()` waits for the first product card. No `waitForTimeout`.
3. **The cart is saved on the server**: `clearCart()` runs before every cart, checkout and E2E test.
4. **The same users run in several tests**: `workers: 1`, so tests run one after another.
5. **The country dropdown appears while you type**: `pressSequentially` with a delay, wait for `.ta-results`, click with `exact: true`.
6. **Registration can only run once**: R01 is tagged `@registerOnce` and only runs with `npm run register`.
7. **The site is public and slow**: 60s test timeout, 15s action timeout, 10s assertion timeout, 1 retry.
8. **URLs use a hash (`#/dashboard`)**: check them with patterns like `toHaveURL(/dashboard/)`.
