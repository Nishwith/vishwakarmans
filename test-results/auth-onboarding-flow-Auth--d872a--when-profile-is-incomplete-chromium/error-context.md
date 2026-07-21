# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-onboarding-flow.spec.js >> Auth Onboarding / Profile Completion Flow >> forces redirect to /complete-profile on login when profile is incomplete
- Location: tests\e2e\auth-onboarding-flow.spec.js:79:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/complete-profile/
Received string:  "https://accounts.google.com/v3/signin/identifier?opparams=%253Fredirect_to%253Dhttp%25253A%25252F%25252Flocalhost%25253A5173%25252F&dsh=S973329431%3A1784398456680166&client_id=997515572364-f4g58mv8kjd5g4pkd3kqiu8gme37i8e4.apps.googleusercontent.com&o2v=2&redirect_uri=https%3A%2F%2Famcsynborvioqgqmsbhn.supabase.co%2Fauth%2Fv1%2Fcallback&response_type=code&scope=email+profile&service=lso&state=3b0663e5-062f-45df-a138-1367d0a06d33&flowName=GeneralOAuthFlow&continue=https%3A%2F%2Faccounts.google.com%2Fsignin%2Foauth%2Fconsent%3Fauthuser%3Dunknown%26part%3DAJi8hAM571erPzJDV5CDx345jLCaeTvaw3LhHN1pRqjpMcDx33sFt6G4QxNzA_9Ia2zmSnm81h25J9s2C7ECizCoi7wWPQbIr7LGuCPLMt6zk7GCPlDIim9kgHIGoKfiBXwSNBM2Hn2KeB6tVOnOrBtbpZ5B7IORERXZN7UumvTKtoPHCZndIbunnvpxnqp6vaQ6j7swiOZAQJLa4DYe56mfVcWqbIFnLkSWPvM-KOpIsoPyIRA9e5nBPvcayhikom5orlu0S5N7TQ2tQztl7hi48izo0PG9DZCoX1KY6DsFZPJK32sLTGKZEYsrVaAhn5aZp6C8KMka9PUCwWDTXu7lK1VchmwySZvF5aVxcbznl6V2rvrELvFmz5MHCUeFK4ksPPZ4jtzpI7cZwx9EMYWeuMGUYlMnjAsDQEIMpKF5LB-0m6Hoc71I9jSZDz7rTA33L4r_5k8reUP4VzMJ_vQtt4JAxjFF74ye1RYXWw5pcD5HhLJcyW0%26flowName%3DGeneralOAuthFlow%26as%3DS973329431%253A1784398456680166%26client_id%3D997515572364-f4g58mv8kjd5g4pkd3kqiu8gme37i8e4.apps.googleusercontent.com%26requestPath%3D%252Fsignin%252Foauth%252Fconsent%23&app_domain=https%3A%2F%2Famcsynborvioqgqmsbhn.supabase.co&rart=ANgoxce1vBAMCJsSQ0XP6Zy0KMncWhQK_BxDpi6n9u7eqQJ3xNj8rEDGzdTOuP2lp1nsaaNqWCWk3PUl82dhY40Hkd50gXY7_gqomHUbKhrtwEj8bJ36rY0"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "https://accounts.google.com/v3/signin/identifier?opparams=%253Fredirect_to%253Dhttp%25253A%25252F%25252Flocalhost%25253A5173%25252F&dsh=S973329431%3A1784398456680166&client_id=997515572364-f4g58mv8kjd5g4pkd3kqiu8gme37i8e4.apps.googleusercontent.com&o2v=2&redirect_uri=https%3A%2F%2Famcsynborvioqgqmsbhn.supabase.co%2Fauth%2Fv1%2Fcallback&response_type=code&scope=email+profile&service=lso&state=3b0663e5-062f-45df-a138-1367d0a06d33&flowName=GeneralOAuthFlow&continue=https%3A%2F%2Faccounts.google.com%2Fsignin%2Foauth%2Fconsent%3Fauthuser%3Dunknown%26part%3DAJi8hAM571erPzJDV5CDx345jLCaeTvaw3LhHN1pRqjpMcDx33sFt6G4QxNzA_9Ia2zmSnm81h25J9s2C7ECizCoi7wWPQbIr7LGuCPLMt6zk7GCPlDIim9kgHIGoKfiBXwSNBM2Hn2KeB6tVOnOrBtbpZ5B7IORERXZN7UumvTKtoPHCZndIbunnvpxnqp6vaQ6j7swiOZAQJLa4DYe56mfVcWqbIFnLkSWPvM-KOpIsoPyIRA9e5nBPvcayhikom5orlu0S5N7TQ2tQztl7hi48izo0PG9DZCoX1KY6DsFZPJK32sLTGKZEYsrVaAhn5aZp6C8KMka9PUCwWDTXu7lK1VchmwySZvF5aVxcbznl6V2rvrELvFmz5MHCUeFK4ksPPZ4jtzpI7cZwx9EMYWeuMGUYlMnjAsDQEIMpKF5LB-0m6Hoc71I9jSZDz7rTA33L4r_5k8reUP4VzMJ_vQtt4JAxjFF74ye1RYXWw5pcD5HhLJcyW0%26flowName%3DGeneralOAuthFlow%26as%3DS973329431%253A1784398456680166%26client_id%3D997515572364-f4g58mv8kjd5g4pkd3kqiu8gme37i8e4.apps.googleusercontent.com%26requestPath%3D%252Fsignin%252Foauth%252Fconsent%23&app_domain=https%3A%2F%2Famcsynborvioqgqmsbhn.supabase.co&rart=ANgoxce1vBAMCJsSQ0XP6Zy0KMncWhQK_BxDpi6n9u7eqQJ3xNj8rEDGzdTOuP2lp1nsaaNqWCWk3PUl82dhY40Hkd50gXY7_gqomHUbKhrtwEj8bJ36rY0"

```

```yaml
- main:
  - text: Sign in with Google
  - heading "Sign in" [level=1]
  - text: to continue to
  - button "amcsynborvioqgqmsbhn.supabase.co"
  - textbox "Email or phone"
  - button "Forgot email?"
  - button "Next"
  - button "Create account"
- contentinfo:
  - combobox "Change language English (United States)"
  - list:
    - listitem:
      - link "Open Google Account Help Center (external, opens in a new window)":
        - /url: https://support.google.com/accounts?hl=en-US&p=account_iph
        - text: Help
    - listitem:
      - link "Privacy Policy (external, opens in a new window)":
        - /url: https://accounts.google.com/TOS?loc=IN&hl=en-US&privacy=true
        - text: Privacy
    - listitem:
      - link "Google Terms of Service (external, opens in a new window)":
        - /url: https://accounts.google.com/TOS?loc=IN&hl=en-US
        - text: Terms
- iframe
```

# Test source

```ts
  17  |             email: 'test@example.com',
  18  |             user_metadata: { full_name: 'Test User' },
  19  |           },
  20  |         }),
  21  |       });
  22  |     });
  23  | 
  24  |     await page.route('**/auth/v1/user', async (route) => {
  25  |       await route.fulfill({
  26  |         status: 200,
  27  |         contentType: 'application/json',
  28  |         body: JSON.stringify({
  29  |           id: 'mock-user-uuid',
  30  |           email: 'test@example.com',
  31  |           user_metadata: { full_name: 'Test User' },
  32  |         }),
  33  |       });
  34  |     });
  35  | 
  36  |     // 2. Mock Supabase Database Reads for profile (uncompleted first)
  37  |     await page.route('**/rest/v1/users?id=eq.*', async (route) => {
  38  |       const method = route.request().method();
  39  |       if (method === 'GET') {
  40  |         await route.fulfill({
  41  |           status: 200,
  42  |           contentType: 'application/json',
  43  |           body: JSON.stringify([
  44  |             {
  45  |               id: 'mock-user-uuid',
  46  |               email: 'test@example.com',
  47  |               full_name: 'Test User',
  48  |               phone: null,
  49  |               city: null,
  50  |               role: 'client',
  51  |               profile_completed: false, // Uncompleted profile
  52  |             },
  53  |           ]),
  54  |         });
  55  |       } else if (method === 'PATCH') {
  56  |         // Assert the correct payload is sent
  57  |         const payload = route.request().postDataJSON();
  58  |         expect(payload.phone).toBe('555-0199');
  59  |         expect(payload.city).toBe('Hyderabad');
  60  |         expect(payload.profile_completed).toBe(true);
  61  | 
  62  |         await route.fulfill({
  63  |           status: 204,
  64  |           contentType: 'application/json',
  65  |         });
  66  |       }
  67  |     });
  68  | 
  69  |     // Mock designer applications read to prevent dashboard loading crashes
  70  |     await page.route('**/rest/v1/designer_applications?*', async (route) => {
  71  |       await route.fulfill({
  72  |         status: 200,
  73  |         contentType: 'application/json',
  74  |         body: JSON.stringify([]),
  75  |       });
  76  |     });
  77  |   });
  78  | 
  79  |   test('forces redirect to /complete-profile on login when profile is incomplete', async ({ page }) => {
  80  |     // Go to login page
  81  |     await page.goto('/login');
  82  | 
  83  |     // Fill credentials
  84  |     await page.fill('input[name="email"]', 'test@example.com');
  85  |     await page.fill('input[name="password"]', 'Password123!');
  86  | 
  87  |     // Intercept subsequent GET users to show completed after the PATCH triggers
  88  |     let profileUpdated = false;
  89  |     await page.route('**/rest/v1/users?id=eq.*', async (route) => {
  90  |       const method = route.request().method();
  91  |       if (method === 'GET') {
  92  |         await route.fulfill({
  93  |           status: 200,
  94  |           contentType: 'application/json',
  95  |           body: JSON.stringify([
  96  |             {
  97  |               id: 'mock-user-uuid',
  98  |               email: 'test@example.com',
  99  |               full_name: 'Test User',
  100 |               phone: profileUpdated ? '555-0199' : null,
  101 |               city: profileUpdated ? 'Hyderabad' : null,
  102 |               role: 'client',
  103 |               profile_completed: profileUpdated,
  104 |             },
  105 |           ]),
  106 |         });
  107 |       } else if (method === 'PATCH') {
  108 |         profileUpdated = true;
  109 |         await route.fulfill({ status: 204 });
  110 |       }
  111 |     });
  112 | 
  113 |     // Click sign in
  114 |     await page.click('button:has-text("Sign In")');
  115 | 
  116 |     // Verify it intercepts and redirects to /complete-profile
> 117 |     await expect(page).toHaveURL(/\/complete-profile/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  118 | 
  119 |     // Locate fields and type complete data
  120 |     await page.fill('input[id="phone"]', '555-0199');
  121 |     await page.fill('input[id="city"]', 'Hyderabad');
  122 | 
  123 |     // Click submit
  124 |     await page.click('button:has-text("Explore Marketplace")');
  125 | 
  126 |     // Verify redirect back to homepage (or dashboard) after completing profile
  127 |     await expect(page).toHaveURL('/');
  128 |   });
  129 | });
  130 | 
```