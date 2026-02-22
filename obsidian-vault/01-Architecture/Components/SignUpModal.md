# SignUpModal

> Registration modal for new users
> Location: `src/components/SignUpModal.tsx`

## 📝 i18n Status

**Phase 4:** ⏳ Review Pending (PR #28)

### Strings Replaced (22 total)

#### Form Labels
| Key | Georgian | English | Russian |
|-----|----------|---------|---------|
| `createAccount` | ანგარიშის შექმნა | Create Account | Создать аккаунт |
| `firstName` | სახელი | First Name | Имя |
| `lastName` | გვარი | Last Name | Фамилия |
| `phoneNumber` | ტელეფონის ნომერი | Phone Number | Номер телефона |
| `confirmPassword` | პაროლის დადასტურება | Confirm Password | Подтвердите пароль |

#### Validation Errors
| Key | Georgian | English | Russian |
|-----|----------|---------|---------|
| `firstNameRequired` | სახელი სავალდებულოა | First name is required | Имя обязательно |
| `lastNameRequired` | გვარი სავალდებულოა | Last name is required | Фамилия обязательна |
| `emailRequired` | Email სავალდებულოა | Email is required | Email обязателен |
| `validEmailRequired` | გთხოვთ შეიყვანეთ სწორი Email | Please enter a valid email | Пожалуйста, введите корректный email |
| `passwordRequired` | პაროლი სავალდებულოა | Password is required | Пароль обязателен |
| `passwordMinLength` | პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს | Password must be at least 8 characters | Пароль должен быть не менее 8 символов |
| `passwordsDoNotMatch` | პაროლები არ ემთხვევა | Passwords do not match | Пароли не совпадают |
| `agreeToTermsRequired` | თქვენ უნდა დაეთანხმოთ წესებსა და პირობებს | You must agree to the terms and conditions | Вы должны согласиться с правилами и условиями |

#### API Errors
| Key | Georgian | English | Russian |
|-----|----------|---------|---------|
| `emailAlreadyExists` | ანგარიში ამ Email-ით უკვე არსებობს | An account with this email already exists | Аккаунт с этим email уже существует |
| `registrationFailed` | რეგისტრაცია ვერ მოხერხდა. სცადეთ თავიდან. | Registration failed. Please try again | Регистрация не удалась. Попробуйте снова |
| `autoLoginFailed` | ანგარიში შექმნილია, მაგრამ ავტომატური შესვლა ვერ მოხერხდა | Account created but auto-login failed. Please log in manually | Аккаунт создан, но автоматический вход не удался |

#### UI Text
| Key | Georgian | English | Russian |
|-----|----------|---------|---------|
| `creatingAccount` | ანგარიშის შექმნა... | Creating Account... | Создание аккаунта... |
| `iAgreeToThe` | ვეთანხმები | I agree to the | Я согласен с |
| `termsOfService` | გამოყენების წესებს | Terms of Service | Условиями использования |
| `and` | და | and | и |
| `privacyPolicy` | კონფიდენციალურობის პოლიტიკას | Privacy Policy | Политикой конфиденциальности |
| `alreadyHaveAccount` | უკვე გაქვთ ანგარიში? | Already have an account? | Уже есть аккаунт? |
| `signInInstead` | შესვლა | Sign in instead | Войти |
| `enterFirstName` | შეიყვანეთ სახელი | Enter first name | Введите имя |
| `enterLastName` | შეიყვანეთ გვარი | Enter last name | Введите фамилию |

## 🔗 Related
- [[LoginModal]] — Login modal (completed)
- [[AuthContext]] — Authentication state
- [[2026-02-19-i18n-phase-4-auth]] — Task tracking

## 🏷️ Tags
#component #auth #modal #i18n-in-progress
