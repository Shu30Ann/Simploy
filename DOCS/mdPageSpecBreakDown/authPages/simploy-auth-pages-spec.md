# Simploy — Auth Pages Spec (Login + Signup)
> Hand this file to Claude Code. Build all authentication pages.

---

## 1. Pages Covered

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Email/password + Google OAuth |
| Signup | `/signup` | 2-step: role selection → account form |
| Forgot Password | `/forgot-password` | Request reset link |

---

## 2. Tech Stack

Same as the landing page spec, plus:
- `react-hook-form` — form state and submission handling
- `zod` — validation schemas
- `@hookform/resolvers/zod` — connect zod to react-hook-form

---

## 3. File Structure

```
app/
  (auth)/
    layout.tsx                  ← Auth route group layout (no navbar/footer)
    login/
      page.tsx
    signup/
      page.tsx
    forgot-password/
      page.tsx

components/
  auth/
    AuthLayout.tsx              ← Split-panel wrapper used on all auth pages
    AuthLeftPanel.tsx           ← Decorative left side (changes per page/role)
    LoginForm.tsx               ← Full login form
    SignupFlow.tsx              ← Step controller (manages step 1 → 2)
    RoleSelect.tsx              ← Step 1: employee vs employer cards
    SignupForm.tsx              ← Step 2: account creation fields
    GoogleAuthButton.tsx        ← Shared Google OAuth button
    PasswordInput.tsx           ← Input with show/hide toggle
    StepIndicator.tsx           ← "Step 1 of 2" progress dots
    FormError.tsx               ← Inline field error message
```

---

## 4. Design Tokens — Auth Additions

Add to `globals.css` `:root` (in addition to landing page tokens):

```css
--input-border:       #E2D9F3;
--input-border-focus: #E8197A;
--input-border-error: #EF4444;
--input-bg:           #FFFFFF;
--label-color:        #374151;
--error-bg:           #FFF5F5;
--error-border:       #FECACA;
--error-text:         #DC2626;
--success-bg:         #F0FDF4;
--success-border:     #BBF7D0;
--success-text:       #15803D;
--divider-color:      #F0EBF8;
--google-border:      #E5E7EB;
```

### Input base class (apply to all `<input>` elements in forms):
```
w-full px-4 py-3 rounded-xl border border-[--input-border] bg-[--input-bg]
text-sm text-[--text-primary] placeholder:text-[--text-muted]
focus:outline-none focus:ring-2 focus:ring-[--pink]/20 focus:border-[--pink]
transition-all duration-150
```

### Input error state (add when field has error):
```
border-[--input-border-error] focus:ring-red-50 focus:border-[--input-border-error]
```

### Label base class:
```
block text-sm font-medium text-[--label-color] mb-1.5
```

---

## 5. Shared: AuthLayout.tsx

Split-screen layout used by all three auth pages.

**Props**: `{ children: ReactNode, leftPanel: ReactNode }`

**Outer**: `min-h-screen flex`

**Left panel wrapper** (hidden on mobile, visible md+):
```
hidden md:flex md:w-1/2 relative overflow-hidden
bg-gradient-to-br from-[--bg-pink-soft] via-[--pink-lighter] to-[--purple-light]
```

**Right panel wrapper** (full width on mobile, half on desktop):
```
w-full md:w-1/2 flex items-center justify-center
min-h-screen bg-white px-8 py-12
```

The right panel has a max content width: `w-full max-w-[420px]`

**Background decoration on left panel** (absolutely positioned, non-interactive):
```tsx
// Soft blurred circles for depth
<div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-[--pink] opacity-5" />
<div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full bg-purple-400 opacity-5" />
```

---

## 6. Shared: AuthLeftPanel.tsx

**Props**:
```ts
interface AuthLeftPanelProps {
  headline: string;
  subtext: string;
  features: Array<{ icon: LucideIcon; text: string }>;
}
```

**Layout** (`flex flex-col h-full p-10`):

**Top** — Logo:
```tsx
<p className="text-xl font-bold text-[--pink]">Simploy</p>
```

**Middle** (flex-1, flex flex-col justify-center):

Headline: `text-[32px] font-bold text-[--text-primary] leading-[1.2] max-w-[280px]`

Subtext: `text-sm text-[--text-secondary] mt-3 max-w-[260px] leading-relaxed`

Feature cards (mt-10, flex flex-col gap-3):
```tsx
{features.map((f, i) => (
  <motion.div
    key={i}
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 * i, duration: 0.4 }}
    className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl
      px-4 py-3 border border-[--border] w-fit"
  >
    <div className="w-8 h-8 rounded-lg bg-[--pink-lighter] flex items-center justify-center flex-shrink-0">
      <f.icon size={15} className="text-[--pink]" />
    </div>
    <p className="text-sm font-medium text-[--text-primary]">{f.text}</p>
  </motion.div>
))}
```

**Bottom** (mt-auto):
```tsx
<div className="flex items-center gap-2 text-xs text-[--text-muted]">
  <Lock size={11} />
  <span>Your data is encrypted and never sold.</span>
</div>
```

---

## 7. Shared: GoogleAuthButton.tsx

Used on both login and signup.

```tsx
<button className="w-full flex items-center justify-center gap-3
  border border-[--google-border] rounded-xl px-4 py-3
  text-sm font-medium text-[--text-primary] bg-white
  hover:bg-gray-50 transition-colors">
  {/* Google SVG icon (inline) */}
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
  Continue with Google
</button>
```

**On click (prototype)**: For now, console.log and redirect to the appropriate onboarding/dashboard page.

---

## 8. Shared: Divider (OR separator)

Used between Google button and email form.

```tsx
<div className="relative my-5">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-[--divider-color]" />
  </div>
  <div className="relative flex justify-center">
    <span className="bg-white px-3 text-xs text-[--text-muted]">or continue with email</span>
  </div>
</div>
```

---

## 9. Shared: PasswordInput.tsx

An `<input type="password">` with an eye toggle.

```tsx
const [show, setShow] = useState(false);

<div className="relative">
  <input
    type={show ? "text" : "password"}
    className={inputBaseClass}
    {...register("password")}
  />
  <button
    type="button"
    onClick={() => setShow(!show)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--text-secondary]"
  >
    {show ? <EyeOff size={16} /> : <Eye size={16} />}
  </button>
</div>
```

---

## 10. Shared: FormError.tsx

Displays a field-level error message below an input.

```tsx
{error && (
  <p className="text-xs text-[--error-text] mt-1.5 flex items-center gap-1">
    <AlertCircle size={12} />
    {error.message}
  </p>
)}
```

---

## 11. Login Page — `/login`

### page.tsx

```tsx
<AuthLayout leftPanel={<AuthLeftPanel headline="Welcome back." subtext="The career OS for modern teams." features={DEFAULT_FEATURES} />}>
  <LoginForm />
</AuthLayout>
```

`DEFAULT_FEATURES`:
```ts
[
  { icon: Sparkles, text: "AI-powered job matching" },
  { icon: BarChart3, text: "Workforce gap simulation" },
  { icon: Zap, text: "Automated action plans" },
]
```

---

### LoginForm.tsx

**"use client"** at top.

**Validation schema (zod)**:
```ts
const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
```

**Layout** (flex flex-col, full width):

**Header**:
```tsx
<div className="mb-8">
  {/* Mobile-only logo */}
  <p className="text-xl font-bold text-[--pink] mb-6 md:hidden">Simploy</p>
  <h1 className="text-2xl font-bold text-[--text-primary]">Sign in</h1>
  <p className="text-sm text-[--text-secondary] mt-1">
    Don't have an account?{" "}
    <a href="/signup" className="text-[--pink] font-medium hover:underline">Create one free</a>
  </p>
</div>
```

**Google button**: `<GoogleAuthButton />`

**OR divider**: `<Divider />`

**Form fields**:

1. Email field:
   ```tsx
   <div>
     <label className={labelClass}>Email address</label>
     <input type="email" placeholder="you@company.com" {...register("email")} />
     <FormError error={errors.email} />
   </div>
   ```

2. Password field:
   ```tsx
   <div>
     <div className="flex items-center justify-between mb-1.5">
       <label className={labelClass}>Password</label>
       <a href="/forgot-password" className="text-xs text-[--pink] hover:underline">
         Forgot password?
       </a>
     </div>
     <PasswordInput register={register} name="password" />
     <FormError error={errors.password} />
   </div>
   ```

3. Remember me row:
   ```tsx
   <div className="flex items-center gap-2">
     <input type="checkbox" id="remember" className="w-4 h-4 rounded accent-[--pink]" />
     <label htmlFor="remember" className="text-sm text-[--text-secondary]">Remember me for 30 days</label>
   </div>
   ```

**Submit button**:
```tsx
<button
  type="submit"
  disabled={isSubmitting}
  className="w-full bg-[--pink] hover:bg-[--pink-hover] text-white font-medium
    py-3 rounded-xl text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed
    flex items-center justify-center gap-2 mt-2"
>
  {isSubmitting ? (
    <>
      <Loader2 size={16} className="animate-spin" />
      Signing in...
    </>
  ) : "Sign in"}
</button>
```

**On submit (prototype)**:
```ts
const onSubmit = async (data) => {
  // Simulate API delay
  await new Promise(res => setTimeout(res, 1200));
  // Redirect to employer dashboard (mock — in real app this would check user role)
  router.push("/employer/dashboard");
};
```

**Footer** (below form, mt-8, text-center):
```tsx
<p className="text-xs text-[--text-muted]">
  By signing in you agree to our{" "}
  <a href="#" className="underline hover:text-[--text-secondary]">Terms</a>
  {" "}and{" "}
  <a href="#" className="underline hover:text-[--text-secondary]">Privacy Policy</a>.
</p>
```

---

## 12. Signup Page — `/signup`

### page.tsx

Read `?role=employee` or `?role=employer` from search params and pass as `initialRole` prop to `<SignupFlow>`.

```tsx
export default function SignupPage({ searchParams }: { searchParams: { role?: string } }) {
  return (
    <SignupFlow initialRole={searchParams.role} />
  );
}
```

---

### SignupFlow.tsx

**"use client"**

State:
```ts
const [step, setStep] = useState<1 | 2>(1);
const [role, setRole] = useState<"employee" | "employer" | null>(
  initialRole === "employee" || initialRole === "employer" ? initialRole : null
);
```

Step 1 renders `<RoleSelect>`.
Step 2 renders the full `<AuthLayout>` with the correct left panel + `<SignupForm>`.

**Step 1** uses `<RoleSelect role={role} onSelect={(r) => { setRole(r); setStep(2); }} />`

**Step 2** renders:
```tsx
<AuthLayout
  leftPanel={
    <AuthLeftPanel
      headline={role === "employee"
        ? "Your next career move starts here."
        : "Build the workforce you need."}
      subtext={role === "employee"
        ? "Join thousands of professionals growing smarter with Simploy."
        : "230+ companies already simulate their workforce with Simploy."}
      features={role === "employee" ? EMPLOYEE_FEATURES : EMPLOYER_FEATURES}
    />
  }
>
  <SignupForm role={role} onBack={() => setStep(1)} />
</AuthLayout>
```

**Features arrays**:
```ts
const EMPLOYEE_FEATURES = [
  { icon: Sparkles, text: "AI-powered job matching" },
  { icon: TrendingUp, text: "Skill gap analysis" },
  { icon: Building2, text: "Internal mobility alerts" },
];

const EMPLOYER_FEATURES = [
  { icon: BarChart3, text: "Live workforce analytics" },
  { icon: Sliders, text: "What-if gap simulation" },
  { icon: Zap, text: "Automated action plans" },
];
```

---

### RoleSelect.tsx

**Full-page centered layout** (no AuthLayout split — this step stands alone, full screen):

```
min-h-screen bg-[--bg-page] flex flex-col items-center justify-center px-6 py-16
```

**Top logo**:
```tsx
<p className="text-xl font-bold text-[--pink] mb-12">Simploy</p>
```

**Headline**:
```tsx
<h1 className="text-3xl font-bold text-[--text-primary] text-center">
  How will you use Simploy?
</h1>
<p className="text-sm text-[--text-secondary] mt-2 text-center">
  We'll tailor your experience based on your answer.
</p>
```

**Two role cards** (mt-10, grid grid-cols-1 sm:grid-cols-2 gap-4, max-w-[600px] w-full):

Each card is a `<button>` that calls `onSelect(role)`.

**Employee Card**:
```tsx
<button
  onClick={() => onSelect("employee")}
  className={`
    flex flex-col items-start p-6 rounded-2xl border-2 text-left w-full
    transition-all duration-200 cursor-pointer group
    ${role === "employee"
      ? "border-[--pink] bg-[--pink-lighter] shadow-[--shadow-card]"
      : "border-[--border] bg-white hover:border-[--pink-border] hover:bg-[--pink-lighter]/50"
    }
  `}
>
  {/* Icon */}
  <div className="w-12 h-12 rounded-xl bg-[--pink-lighter] border border-[--pink-border]
    flex items-center justify-center mb-4 group-hover:bg-[--pink-light] transition-colors">
    <UserCircle2 size={24} className="text-[--pink]" />
  </div>

  {/* Title */}
  <p className="text-base font-semibold text-[--text-primary]">I'm an employee</p>
  <p className="text-sm text-[--text-secondary] mt-1">
    Looking for new roles, tracking my skills, and growing my career.
  </p>

  {/* Feature tags */}
  <div className="flex flex-wrap gap-2 mt-4">
    {["Job matching", "Skill gaps", "Internal mobility"].map(tag => (
      <span key={tag} className="text-xs px-2.5 py-1 rounded-full
        bg-white border border-[--pink-border] text-[--text-secondary]">
        {tag}
      </span>
    ))}
  </div>

  {/* Selected checkmark */}
  {role === "employee" && (
    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[--pink]
      flex items-center justify-center">
      <Check size={12} color="white" strokeWidth={3} />
    </div>
  )}
</button>
```

**Employer Card** (same structure, different content):
- Icon: `Building2`
- Title: `I'm an employer`
- Description: `Building teams, planning workforce strategy, and closing talent gaps.`
- Tags: `"Workforce data"`, `"Gap simulation"`, `"Action plans"`

Both cards need `position: relative` for the checkmark overlay.

**Continue button** (mt-6, w-full max-w-[600px], disabled until a role is selected):
```tsx
<button
  onClick={handleContinue}
  disabled={!role}
  className="w-full max-w-[600px] bg-[--pink] text-white font-medium py-3.5
    rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed
    hover:bg-[--pink-hover] flex items-center justify-center gap-2"
>
  Continue <ArrowRight size={15} />
</button>
```

**Bottom link**:
```tsx
<p className="text-sm text-[--text-secondary] mt-5">
  Already have an account?{" "}
  <a href="/login" className="text-[--pink] font-medium hover:underline">Sign in</a>
</p>
```

---

### SignupForm.tsx

**Props**: `{ role: "employee" | "employer"; onBack: () => void }`

**"use client"**

**Validation schema**:
```ts
const baseSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Must be at least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number"),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms to continue" }),
  }),
});

const employerSchema = baseSchema.extend({
  companyName: z.string().min(2, "Please enter your company name"),
});

// Use baseSchema for employee, employerSchema for employer
const schema = role === "employer" ? employerSchema : baseSchema;
```

**Layout** (full width, flex flex-col):

**Header**:
```tsx
{/* Back link + Step indicator */}
<div className="flex items-center justify-between mb-6">
  <button
    onClick={onBack}
    className="flex items-center gap-1.5 text-sm text-[--text-secondary] hover:text-[--text-primary]"
  >
    <ChevronLeft size={16} />
    Back
  </button>
  <StepIndicator current={2} total={2} />
</div>

{/* Mobile logo */}
<p className="text-xl font-bold text-[--pink] mb-4 md:hidden">Simploy</p>

<div className="mb-6">
  <h1 className="text-2xl font-bold text-[--text-primary]">
    {role === "employee" ? "Create your account" : "Set up your employer account"}
  </h1>
  <p className="text-sm text-[--text-secondary] mt-1">
    {role === "employee"
      ? "Start finding better opportunities today."
      : "Start simulating your workforce in minutes."}
  </p>
</div>
```

**Google button**: `<GoogleAuthButton />`

**OR divider**: `<Divider />`

**Form fields** (flex flex-col gap-4):

**For both roles**:

1. Full name:
   ```
   label: "Full name"
   placeholder: "Alex Johnson"
   type: text
   register: "fullName"
   ```

2. Work email:
   ```
   label: "Work email"
   placeholder: "alex@company.com"
   type: email
   register: "email"
   ```

3. Password: `<PasswordInput>` with label "Password"
   - Below the input, show password strength indicator (see PasswordStrength below)

**Employer only** (render between fullName and email):
```
label: "Company name"
placeholder: "Acme Corp"
type: text
register: "companyName"
```

**Terms checkbox**:
```tsx
<div>
  <div className="flex items-start gap-3">
    <input
      type="checkbox"
      id="terms"
      {...register("terms")}
      className="w-4 h-4 mt-0.5 rounded accent-[--pink] flex-shrink-0"
    />
    <label htmlFor="terms" className="text-sm text-[--text-secondary] leading-relaxed">
      I agree to Simploy's{" "}
      <a href="#" className="text-[--pink] hover:underline">Terms of Service</a>
      {" "}and{" "}
      <a href="#" className="text-[--pink] hover:underline">Privacy Policy</a>.
    </label>
  </div>
  <FormError error={errors.terms} />
</div>
```

**Submit button**:
```tsx
<button
  type="submit"
  disabled={isSubmitting}
  className="w-full bg-[--pink] hover:bg-[--pink-hover] text-white font-medium
    py-3 rounded-xl text-sm transition-colors disabled:opacity-60
    flex items-center justify-center gap-2 mt-2"
>
  {isSubmitting ? (
    <><Loader2 size={16} className="animate-spin" /> Creating your account...</>
  ) : (
    role === "employee" ? "Create free account" : "Create employer account"
  )}
</button>
```

**On submit (prototype)**:
```ts
const onSubmit = async (data) => {
  await new Promise(res => setTimeout(res, 1400));
  router.push(
    role === "employee" ? "/onboarding/employee" : "/onboarding/employer"
  );
};
```

**Bottom sign-in link**:
```tsx
<p className="text-center text-sm text-[--text-secondary] mt-4">
  Already have an account?{" "}
  <a href="/login" className="text-[--pink] font-medium hover:underline">Sign in</a>
</p>
```

---

### Password Strength Indicator (inside PasswordInput.tsx)

Show below the password field when the field has a value. Four rules — each lights up when met:

```tsx
const rules = [
  { label: "8+ characters",        met: value.length >= 8 },
  { label: "Uppercase letter",     met: /[A-Z]/.test(value) },
  { label: "Number",               met: /[0-9]/.test(value) },
  { label: "Special character",    met: /[^a-zA-Z0-9]/.test(value) },
];

// Strength level: 0-4 based on how many rules are met
const strength = rules.filter(r => r.met).length;

const strengthConfig = {
  0: { label: "",        color: "" },
  1: { label: "Weak",    color: "#EF4444" },
  2: { label: "Fair",    color: "#F59E0B" },
  3: { label: "Good",    color: "#06B6D4" },
  4: { label: "Strong",  color: "#10B981" },
};
```

Visual:
```tsx
{value && (
  <div className="mt-2">
    {/* Four segmented bars */}
    <div className="flex gap-1 mb-2">
      {[1,2,3,4].map(level => (
        <div
          key={level}
          className="h-1 flex-1 rounded-full transition-all duration-300"
          style={{
            background: strength >= level
              ? strengthConfig[strength].color
              : "var(--divider-color)"
          }}
        />
      ))}
    </div>

    {/* Rule checklist */}
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      {rules.map(rule => (
        <div key={rule.label} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded-full flex items-center justify-center
            ${rule.met ? "bg-[--teal]" : "bg-[--divider-color]"}`}>
            {rule.met && <Check size={8} color="white" strokeWidth={3} />}
          </div>
          <span className={`text-[11px] ${rule.met ? "text-[--teal]" : "text-[--text-muted]"}`}>
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  </div>
)}
```

---

### StepIndicator.tsx

Used in the signup form header.

```tsx
// Props: { current: number, total: number }

<div className="flex items-center gap-2">
  {Array.from({ length: total }).map((_, i) => (
    <div
      key={i}
      className={`rounded-full transition-all duration-300 ${
        i + 1 === current
          ? "w-5 h-2 bg-[--pink]"          // active: wider pill
          : i + 1 < current
          ? "w-2 h-2 bg-[--pink]"           // done: filled circle
          : "w-2 h-2 bg-[--divider-color]"  // upcoming: empty circle
      }`}
    />
  ))}
  <span className="text-xs text-[--text-muted] ml-1">Step {current} of {total}</span>
</div>
```

---

## 13. Forgot Password Page — `/forgot-password`

### page.tsx

```tsx
<AuthLayout leftPanel={
  <AuthLeftPanel
    headline="We've got you."
    subtext="Password resets are quick and secure."
    features={DEFAULT_FEATURES}
  />
}>
  <ForgotPasswordForm />
</AuthLayout>
```

---

### ForgotPasswordForm.tsx

**"use client"**

Two UI states: `idle` and `sent`.

**Schema**:
```ts
const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
```

**Idle state layout**:

```tsx
<div>
  {/* Mobile logo */}
  <p className="text-xl font-bold text-[--pink] mb-6 md:hidden">Simploy</p>

  {/* Back to login */}
  <a href="/login" className="flex items-center gap-1.5 text-sm text-[--text-secondary]
    hover:text-[--text-primary] mb-8">
    <ChevronLeft size={16} />
    Back to sign in
  </a>

  {/* Icon */}
  <div className="w-12 h-12 rounded-xl bg-[--pink-lighter] border border-[--pink-border]
    flex items-center justify-center mb-6">
    <KeyRound size={22} className="text-[--pink]" />
  </div>

  <h1 className="text-2xl font-bold text-[--text-primary]">Forgot password?</h1>
  <p className="text-sm text-[--text-secondary] mt-1 mb-8">
    Enter your email and we'll send you a reset link.
  </p>

  {/* Email field */}
  <div>
    <label className={labelClass}>Email address</label>
    <input type="email" placeholder="you@company.com" {...register("email")} />
    <FormError error={errors.email} />
  </div>

  {/* Submit */}
  <button type="submit" disabled={isSubmitting}
    className="w-full bg-[--pink] hover:bg-[--pink-hover] text-white font-medium
      py-3 rounded-xl text-sm transition-colors disabled:opacity-60
      flex items-center justify-center gap-2 mt-4">
    {isSubmitting
      ? <><Loader2 size={16} className="animate-spin" /> Sending...</>
      : "Send reset link"
    }
  </button>
</div>
```

**On submit (prototype)**:
```ts
const onSubmit = async () => {
  await new Promise(res => setTimeout(res, 1000));
  setSent(true);
};
```

**Sent state** (replace the form, animate in with Framer Motion fade):

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.97 }}
  animate={{ opacity: 1, scale: 1 }}
  className="text-center"
>
  {/* Success icon */}
  <div className="w-16 h-16 rounded-2xl bg-[--success-bg] border border-[--success-border]
    flex items-center justify-center mx-auto mb-6">
    <MailCheck size={28} className="text-[--success-text]" />
  </div>

  <h2 className="text-2xl font-bold text-[--text-primary]">Check your inbox</h2>
  <p className="text-sm text-[--text-secondary] mt-2 max-w-[300px] mx-auto leading-relaxed">
    We've sent a reset link to <span className="font-medium text-[--text-primary]">{emailValue}</span>.
    It expires in 30 minutes.
  </p>

  {/* Resend option */}
  <p className="text-sm text-[--text-secondary] mt-8">
    Didn't get it?{" "}
    <button
      onClick={() => setSent(false)}
      className="text-[--pink] font-medium hover:underline"
    >
      Resend email
    </button>
  </p>

  {/* Back to login */}
  <a href="/login" className="flex items-center justify-center gap-1.5 text-sm
    text-[--text-secondary] hover:text-[--text-primary] mt-4">
    <ChevronLeft size={15} />
    Back to sign in
  </a>
</motion.div>
```

---

## 14. Routing & Redirects

| Action | Redirect |
|--------|----------|
| Successful login | `/employer/dashboard` (mock default — real app checks role) |
| Successful signup (employee) | `/onboarding/employee` |
| Successful signup (employer) | `/onboarding/employer` |
| Google OAuth (all) | Same logic as above |
| Forgot password sent | Stay on page, show success state |
| "Back to login" | `/login` |

---

## 15. Animations

All forms: animate in with `motion.div` fade + slight slide-up on mount.

```tsx
// Wrap all form content in:
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35, ease: "easeOut" }}
>
  {/* form content */}
</motion.div>
```

**Signup step transition** (Step 1 → Step 2): Use `AnimatePresence` with exit animation:
```tsx
<AnimatePresence mode="wait">
  {step === 1 ? (
    <motion.div key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}>
      <RoleSelect ... />
    </motion.div>
  ) : (
    <motion.div key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}>
      {/* AuthLayout + SignupForm */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## 16. Responsive Rules

| Breakpoint | Changes |
|------------|---------|
| `< 768px` (mobile) | Left panel hidden. Logo shown inside form area. Full-width layout. |
| `≥ 768px` (tablet+) | Left panel visible at 50% width. |
| RoleSelect cards | Stack to 1 column on mobile, 2 columns on sm+ |

---

## 17. Build Notes for Claude Code

1. **`(auth)` route group**: Wrap all auth pages in an `app/(auth)/` route group with its own `layout.tsx` that does NOT include the main site navbar or footer — just a clean white shell.

2. **Prototype auth**: No real backend. Form submissions simulate a delay with `setTimeout`, then redirect. Do not integrate NextAuth or any auth library.

3. **URL param pre-selection**: On `/signup`, read `searchParams.role` and pass it to `SignupFlow` as `initialRole`. If it matches `"employee"` or `"employer"`, skip Step 1 and go straight to Step 2 with that role pre-selected. Add a back button so users can still change their role.

4. **`react-hook-form` + `zod`**: Use the resolver pattern. All validation is client-side only.

5. **`"use client"` on all form components**: Required for hooks and interactivity.

6. **Accessibility**: All form inputs must have associated labels (via `htmlFor`/`id`). Submit buttons must have `type="submit"`. Password toggle button must have `type="button"` (prevents form submission).

7. **Loading states**: Every submit button should show a spinner (Lucide `Loader2` with `animate-spin`) and disable during submission.
