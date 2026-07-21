# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: project-upload-flow.spec.js >> Designer Project Upload Flow >> successfully uploads a new project with compressed images
- Location: tests\e2e\project-upload-flow.spec.js:132:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard/
Received string:  "https://accounts.google.com/v3/signin/identifier?opparams=%253Fredirect_to%253Dhttp%25253A%25252F%25252Flocalhost%25253A5173%25252F&dsh=S-920886315%3A1784398368587634&client_id=997515572364-f4g58mv8kjd5g4pkd3kqiu8gme37i8e4.apps.googleusercontent.com&o2v=2&redirect_uri=https%3A%2F%2Famcsynborvioqgqmsbhn.supabase.co%2Fauth%2Fv1%2Fcallback&response_type=code&scope=email+profile&service=lso&state=119f9b71-6cc9-4e7b-b0b1-663d40e31e12&flowName=GeneralOAuthFlow&continue=https%3A%2F%2Faccounts.google.com%2Fsignin%2Foauth%2Fconsent%3Fauthuser%3Dunknown%26part%3DAJi8hAO0wTQQlR8J_HEaQiqZKOKcHUCUW3moZQFW-6DuJupC9AGrj8wftodcJ1gnbEQ3Em1AagNI3ic_Owv2dHNOjqg8xcX449ayvfHNUogSPHkcipvdDWxY3Wy-QRV1bHPNrGwBEM5naFL2qcijCF7lSPQs6Wzc1CRQtZsCmMgLXCnPtlC-OTS3svF40LIHLrWoLHgXx6PPkpIWHASPnWNJLRdY2fYBzUr-K2E5jC7ZqFhvhMIAPkFHGZ2QW7Jaq915B-bCQq_fmv2w_jELiAtlTQD8txX-Iqop0M8Pc84V45LYPtBgrQmgmIKDVAFjKl5P2xDp5vdA2kjP_baRB-R8slWhPV9eF-0ENKO3IHgASqPHd9q4f6QpZxcPT6u3VuRfrmkP0XQ4ShbEw5YAnZ4tY3EZ1yvhwg4gbrLmXAUGYa6GG1iKEcFxJE_uMUhACwwWEJRX17QSxyS0MGhdPCKoTFoZybR_LoF-6Abvo9Lkn15EfVcgjSE%26flowName%3DGeneralOAuthFlow%26as%3DS-920886315%253A1784398368587634%26client_id%3D997515572364-f4g58mv8kjd5g4pkd3kqiu8gme37i8e4.apps.googleusercontent.com%26requestPath%3D%252Fsignin%252Foauth%252Fconsent%23&app_domain=https%3A%2F%2Famcsynborvioqgqmsbhn.supabase.co&rart=ANgoxcdObnO3TIoqcXtC7ayNCOr3KbHGtXE59w8dal5miO6cSdOXgJ7XvMW-AGW_7JvLGf6Xc4AQ4ubUEHR51mNrnIyIvxQ9OhQAvhryxjkmsKCDp4gBTsk"

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "https://accounts.google.com/v3/signin/identifier?opparams=%253Fredirect_to%253Dhttp%25253A%25252F%25252Flocalhost%25253A5173%25252F&dsh=S-920886315%3A1784398368587634&client_id=997515572364-f4g58mv8kjd5g4pkd3kqiu8gme37i8e4.apps.googleusercontent.com&o2v=2&redirect_uri=https%3A%2F%2Famcsynborvioqgqmsbhn.supabase.co%2Fauth%2Fv1%2Fcallback&response_type=code&scope=email+profile&service=lso&state=119f9b71-6cc9-4e7b-b0b1-663d40e31e12&flowName=GeneralOAuthFlow&continue=https%3A%2F%2Faccounts.google.com%2Fsignin%2Foauth%2Fconsent%3Fauthuser%3Dunknown%26part%3DAJi8hAO0wTQQlR8J_HEaQiqZKOKcHUCUW3moZQFW-6DuJupC9AGrj8wftodcJ1gnbEQ3Em1AagNI3ic_Owv2dHNOjqg8xcX449ayvfHNUogSPHkcipvdDWxY3Wy-QRV1bHPNrGwBEM5naFL2qcijCF7lSPQs6Wzc1CRQtZsCmMgLXCnPtlC-OTS3svF40LIHLrWoLHgXx6PPkpIWHASPnWNJLRdY2fYBzUr-K2E5jC7ZqFhvhMIAPkFHGZ2QW7Jaq915B-bCQq_fmv2w_jELiAtlTQD8txX-Iqop0M8Pc84V45LYPtBgrQmgmIKDVAFjKl5P2xDp5vdA2kjP_baRB-R8slWhPV9eF-0ENKO3IHgASqPHd9q4f6QpZxcPT6u3VuRfrmkP0XQ4ShbEw5YAnZ4tY3EZ1yvhwg4gbrLmXAUGYa6GG1iKEcFxJE_uMUhACwwWEJRX17QSxyS0MGhdPCKoTFoZybR_LoF-6Abvo9Lkn15EfVcgjSE%26flowName%3DGeneralOAuthFlow%26as%3DS-920886315%253A1784398368587634%26client_id%3D997515572364-f4g58mv8kjd5g4pkd3kqiu8gme37i8e4.apps.googleusercontent.com%26requestPath%3D%252Fsignin%252Foauth%252Fconsent%23&app_domain=https%3A%2F%2Famcsynborvioqgqmsbhn.supabase.co&rart=ANgoxcdObnO3TIoqcXtC7ayNCOr3KbHGtXE59w8dal5miO6cSdOXgJ7XvMW-AGW_7JvLGf6Xc4AQ4ubUEHR51mNrnIyIvxQ9OhQAvhryxjkmsKCDp4gBTsk"

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
  40  |         contentType: 'application/json',
  41  |         body: JSON.stringify([
  42  |           {
  43  |             id: 'mock-designer-uuid',
  44  |             email: 'designer@example.com',
  45  |             role: 'designer',
  46  |             profile_completed: true,
  47  |           },
  48  |         ]),
  49  |       });
  50  |     });
  51  | 
  52  |     // 3. Mock Designer Details Fetch
  53  |     await page.route('**/rest/v1/designers?*', async (route) => {
  54  |       await route.fulfill({
  55  |         status: 200,
  56  |         contentType: 'application/json',
  57  |         body: JSON.stringify([
  58  |           {
  59  |             id: 42,
  60  |             user_id: 'mock-designer-uuid',
  61  |             name: 'Designer Name',
  62  |             is_verified: true,
  63  |             city: 'Hyderabad',
  64  |           },
  65  |         ]),
  66  |       });
  67  |     });
  68  | 
  69  |     // 4. Mock Projects and Connections Reads
  70  |     await page.route('**/rest/v1/designer_projects?*', async (route) => {
  71  |       const method = route.request().method();
  72  |       if (method === 'GET') {
  73  |         await route.fulfill({
  74  |           status: 200,
  75  |           contentType: 'application/json',
  76  |           body: JSON.stringify([]),
  77  |         });
  78  |       } else if (method === 'POST') {
  79  |         const payload = route.request().postDataJSON();
  80  |         await route.fulfill({
  81  |           status: 201,
  82  |           contentType: 'application/json',
  83  |           body: JSON.stringify({
  84  |             id: 999,
  85  |             designer_id: 42,
  86  |             title: payload.title,
  87  |             place: payload.place,
  88  |             project_category: payload.project_category,
  89  |             status: 'approved',
  90  |           }),
  91  |         });
  92  |       }
  93  |     });
  94  | 
  95  |     await page.route('**/rest/v1/connections?*', async (route) => {
  96  |       await route.fulfill({
  97  |         status: 200,
  98  |         contentType: 'application/json',
  99  |         body: JSON.stringify([]),
  100 |       });
  101 |     });
  102 | 
  103 |     // 5. Mock Storage Uploads
  104 |     await page.route('**/storage/v1/object/portfolio/**', async (route) => {
  105 |       await route.fulfill({
  106 |         status: 200,
  107 |         contentType: 'application/json',
  108 |         body: JSON.stringify({
  109 |           Key: 'portfolio/mock-upload-path.webp',
  110 |         }),
  111 |       });
  112 |     });
  113 | 
  114 |     // 6. Mock Project Images Insert
  115 |     await page.route('**/rest/v1/project_images', async (route) => {
  116 |       await route.fulfill({
  117 |         status: 201,
  118 |         contentType: 'application/json',
  119 |         body: JSON.stringify([
  120 |           {
  121 |             id: 1001,
  122 |             project_id: 999,
  123 |             image_url: 'https://amcsynborvioqgqmsbhn.supabase.co/storage/v1/object/public/portfolio/mock-upload-path.webp',
  124 |             room_category: 'Living Room',
  125 |             is_cover: true,
  126 |           },
  127 |         ]),
  128 |       });
  129 |     });
  130 |   });
  131 | 
  132 |   test('successfully uploads a new project with compressed images', async ({ page }) => {
  133 |     // Navigate and login
  134 |     await page.goto('/login');
  135 |     await page.fill('input[name="email"]', 'designer@example.com');
  136 |     await page.fill('input[name="password"]', 'Password123!');
  137 |     await page.click('button:has-text("Sign In")');
  138 | 
  139 |     // Should redirect directly to dashboard
> 140 |     await expect(page).toHaveURL(/\/dashboard/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  141 | 
  142 |     // Fill project form fields
  143 |     await page.fill('input[placeholder="E.g., Modern Minimalist Villa"]', 'Modern Minimalist Villa');
  144 |     await page.fill('input[placeholder="E.g., Jubilee Hills"]', 'Jubilee Hills');
  145 |     await page.fill('textarea[placeholder="Describe the scope, the materials used..."]', 'A gorgeous minimalist design project.');
  146 | 
  147 |     // Select category Living Room
  148 |     await page.click('button:has-text("Living Room")');
  149 | 
  150 |     // Create a simple 1x1 pixel PNG dummy file buffer
  151 |     const dummyImage = Buffer.from(
  152 |       'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  153 |       'base64'
  154 |     );
  155 | 
  156 |     // Upload image
  157 |     await page.setInputFiles('input[type="file"]', {
  158 |       name: 'dummy.png',
  159 |       mimeType: 'image/png',
  160 |       buffer: dummyImage,
  161 |     });
  162 | 
  163 |     // Intercept to check upload & project submission
  164 |     const publishPromise = page.waitForResponse((res) => res.url().includes('/rest/v1/designer_projects') && res.request().method() === 'POST');
  165 | 
  166 |     // Click Publish Complete Project
  167 |     await page.click('button:has-text("Publish Complete Project")');
  168 | 
  169 |     // Await response & assert toast message is rendered
  170 |     await publishPromise;
  171 |     const toast = page.locator('.hot-toast-message, div[role="status"]');
  172 |     await expect(toast).toContainText(/success/i);
  173 |   });
  174 | });
  175 | 
```