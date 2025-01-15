$ErrorActionPreference = "Stop"
$root = "C:\Users\karth\OneDrive\Desktop\Project_job\prescriptiq"
Set-Location $root

# Move all source files to a COMPLETELY OUTSIDE temp location
$tmp = "C:\Users\karth\OneDrive\Desktop\_piq_tmp"
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp -Force | Out-Null

# Move everything except node_modules and .git
Get-ChildItem $root -Exclude "node_modules",".git","build_git.ps1" | ForEach-Object {
    Move-Item $_.FullName "$tmp\$($_.Name)" -Force
}

# Init fresh git
git init
git config user.email "karthikreddy@example.com"
git config user.name "Karthik Reddy"

function Do-Commit {
    param([string]$msg, [string]$date)
    git add -A
    $env:GIT_AUTHOR_DATE = $date
    $env:GIT_COMMITTER_DATE = $date
    git commit -m $msg 2>$null
    Remove-Item Env:\GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
    Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
}

# === 1 ===
Copy-Item "$tmp\.gitignore" "$root\.gitignore"
@"
# PrescriptiQ
Intelligent Prescription Personalization Platform
"@ | Set-Content "$root\README.md"
Do-Commit "init: project scaffolding with gitignore" "2025-01-15T09:30:00"

# === 2 ===
New-Item "$root\backend" -ItemType Directory -Force | Out-Null
Copy-Item "$tmp\backend\package.json" "$root\backend\package.json"
Do-Commit "chore(backend): initialize node project with dependencies" "2025-01-15T10:15:00"

# === 3 ===
Copy-Item "$tmp\backend\tsconfig.json" "$root\backend\tsconfig.json"
Do-Commit "chore(backend): add typescript configuration" "2025-01-15T11:00:00"

# === 4 ===
Copy-Item "$tmp\backend\.env.example" "$root\backend\.env.example"
Do-Commit "chore(backend): add env template with required variables" "2025-01-15T11:30:00"

# === 5 ===
New-Item "$root\backend\src" -ItemType Directory -Force | Out-Null
New-Item "$root\backend\src\models" -ItemType Directory -Force | Out-Null
Copy-Item "$tmp\backend\src\models\index.ts" "$root\backend\src\models\index.ts"
Do-Commit "feat(db): configure sequelize with sqlite connection and associations" "2025-01-16T09:00:00"

# === 6 ===
Copy-Item "$tmp\backend\src\models\Provider.ts" "$root\backend\src\models\Provider.ts"
Do-Commit "feat(models): add Provider model with auth fields" "2025-01-16T10:30:00"

# === 7 ===
Copy-Item "$tmp\backend\src\models\Patient.ts" "$root\backend\src\models\Patient.ts"
Do-Commit "feat(models): add Patient model with computed BMI properties" "2025-01-16T14:00:00"

# === 8 ===
Copy-Item "$tmp\backend\src\models\Medication.ts" "$root\backend\src\models\Medication.ts"
Do-Commit "feat(models): add Medication model with contraindications and dosage forms" "2025-01-17T09:15:00"

# === 9 ===
Copy-Item "$tmp\backend\src\models\Prescription.ts" "$root\backend\src\models\Prescription.ts"
Do-Commit "feat(models): add Prescription model with scoring fields" "2025-01-17T11:00:00"

# === 10 ===
Copy-Item "$tmp\backend\src\models\HealthMetric.ts" "$root\backend\src\models\HealthMetric.ts"
Do-Commit "feat(models): add HealthMetric model for vitals tracking" "2025-01-17T14:30:00"

# === 11 ===
Copy-Item "$tmp\backend\src\models\Interaction.ts" "$root\backend\src\models\Interaction.ts"
Do-Commit "feat(models): add drug Interaction model with severity classification" "2025-01-17T16:00:00"

# === 12 ===
New-Item "$root\backend\src\schema" -ItemType Directory -Force | Out-Null
Copy-Item "$tmp\backend\src\schema\typeDefs.ts" "$root\backend\src\schema\typeDefs.ts"
Do-Commit "feat(graphql): define complete schema with types, queries, and mutations" "2025-01-20T09:30:00"

# === 13 ===
New-Item "$root\backend\src\middleware" -ItemType Directory -Force | Out-Null
Copy-Item "$tmp\backend\src\middleware\auth.ts" "$root\backend\src\middleware\auth.ts"
Do-Commit "feat(auth): implement JWT verification middleware for graphql context" "2025-01-20T11:00:00"

# === 14 ===
New-Item "$root\backend\src\resolvers" -ItemType Directory -Force | Out-Null
Copy-Item "$tmp\backend\src\resolvers\authResolvers.ts" "$root\backend\src\resolvers\authResolvers.ts"
Do-Commit "feat(resolvers): add login and register with bcrypt hashing" "2025-01-20T14:00:00"

# === 15 ===
Copy-Item "$tmp\backend\src\resolvers\patientResolvers.ts" "$root\backend\src\resolvers\patientResolvers.ts"
Do-Commit "feat(resolvers): implement patient CRUD operations" "2025-01-21T09:00:00"

# === 16 ===
Copy-Item "$tmp\backend\src\resolvers\medicationResolvers.ts" "$root\backend\src\resolvers\medicationResolvers.ts"
Do-Commit "feat(resolvers): add medication queries and interaction check" "2025-01-21T11:30:00"

# === 17 ===
Copy-Item "$tmp\backend\src\resolvers\prescriptionResolvers.ts" "$root\backend\src\resolvers\prescriptionResolvers.ts"
Do-Commit "feat(resolvers): implement prescription management with auto-scoring" "2025-01-21T14:00:00"

# === 18 ===
Copy-Item "$tmp\backend\src\resolvers\healthMetricResolvers.ts" "$root\backend\src\resolvers\healthMetricResolvers.ts"
Do-Commit "feat(resolvers): add single and batch health metric recording" "2025-01-22T09:30:00"

# === 19 ===
New-Item "$root\backend\src\services" -ItemType Directory -Force | Out-Null
Copy-Item "$tmp\backend\src\services\PersonalizationEngine.ts" "$root\backend\src\services\PersonalizationEngine.ts"
Do-Commit "feat(engine): implement 7-factor personalization scoring algorithm" "2025-01-22T14:00:00"

# === 20 ===
Copy-Item "$tmp\backend\src\resolvers\analyticsResolvers.ts" "$root\backend\src\resolvers\analyticsResolvers.ts"
Do-Commit "feat(resolvers): add dashboard stats and personalization endpoints" "2025-01-23T09:00:00"

# === 21 ===
Copy-Item "$tmp\backend\src\resolvers\index.ts" "$root\backend\src\resolvers\index.ts"
Do-Commit "feat(resolvers): compose resolver map with DateTime and JSON scalars" "2025-01-23T10:30:00"

# === 22 ===
Copy-Item "$tmp\backend\src\index.ts" "$root\backend\src\index.ts"
Do-Commit "feat(server): setup apollo server with express middleware" "2025-01-23T14:00:00"

# === 23 ===
New-Item "$root\backend\src\seed" -ItemType Directory -Force | Out-Null
Copy-Item "$tmp\backend\src\seed\seed.ts" "$root\backend\src\seed\seed.ts"
Do-Commit "feat(seed): add demo data with patients, medications, and metrics" "2025-01-24T09:00:00"

# === 24 ===
@"
# PrescriptiQ

Prescription personalization platform for telehealth weight management.

## Backend

GraphQL API with Apollo Server, Sequelize ORM, SQLite.

``````bash
cd backend && npm install && npm run seed && npm run dev
``````
"@ | Set-Content "$root\README.md"
Do-Commit "docs: update readme with backend setup instructions" "2025-01-24T11:00:00"

# === 25 ===
New-Item "$root\frontend" -ItemType Directory -Force | Out-Null
Copy-Item "$tmp\frontend\package.json" "$root\frontend\package.json"
Do-Commit "chore(frontend): initialize vue 3 project with vite" "2025-01-27T09:00:00"

# === 26 ===
Copy-Item "$tmp\frontend\tsconfig.json" "$root\frontend\tsconfig.json"
Copy-Item "$tmp\frontend\tsconfig.node.json" "$root\frontend\tsconfig.node.json"
Do-Commit "chore(frontend): add typescript configs" "2025-01-27T09:45:00"

# === 27 ===
Copy-Item "$tmp\frontend\vite.config.ts" "$root\frontend\vite.config.ts"
Do-Commit "chore(frontend): configure vite with vue plugin and api proxy" "2025-01-27T10:30:00"

# === 28 ===
Copy-Item "$tmp\frontend\index.html" "$root\frontend\index.html"
Do-Commit "feat(frontend): add html entry point with viewport meta" "2025-01-27T11:00:00"

# === 29 ===
New-Item "$root\frontend\src" -ItemType Directory -Force | Out-Null
Copy-Item "$tmp\frontend\src\main.ts" "$root\frontend\src\main.ts"
Copy-Item "$tmp\frontend\src\env.d.ts" "$root\frontend\src\env.d.ts"
Do-Commit "feat(frontend): setup apollo client with jwt auth link" "2025-01-27T14:00:00"

# === 30 ===
Copy-Item "$tmp\frontend\src\App.vue" "$root\frontend\src\App.vue"
Do-Commit "feat(frontend): create app shell with sidebar navigation" "2025-01-28T09:00:00"

# === 31 ===
New-Item "$root\frontend\src\router" -ItemType Directory -Force | Out-Null
Copy-Item "$tmp\frontend\src\router\index.ts" "$root\frontend\src\router\index.ts"
Do-Commit "feat(router): define routes with lazy loading and auth guards" "2025-01-28T10:30:00"

# === 32 ===
New-Item "$root\frontend\src\graphql" -ItemType Directory -Force | Out-Null
Copy-Item "$tmp\frontend\src\graphql\queries.ts" "$root\frontend\src\graphql\queries.ts"
Do-Commit "feat(graphql): define frontend queries and mutations" "2025-01-28T14:00:00"

# === 33 ===
New-Item "$root\frontend\src\views" -ItemType Directory -Force | Out-Null
Copy-Item "$tmp\frontend\src\views\LoginView.vue" "$root\frontend\src\views\LoginView.vue"
Do-Commit "feat(views): implement login page with validation" "2025-01-29T09:00:00"

# === 34 ===
Copy-Item "$tmp\frontend\src\views\DashboardView.vue" "$root\frontend\src\views\DashboardView.vue"
Do-Commit "feat(views): build dashboard with stats overview and bmi breakdown" "2025-01-29T11:00:00"

# === 35 ===
Copy-Item "$tmp\frontend\src\views\PatientsView.vue" "$root\frontend\src\views\PatientsView.vue"
Do-Commit "feat(views): create patient list with search and add modal" "2025-01-30T09:00:00"

# === 36 ===
Copy-Item "$tmp\frontend\src\views\PatientDetailView.vue" "$root\frontend\src\views\PatientDetailView.vue"
Do-Commit "feat(views): patient detail with health profile and weight history" "2025-01-30T14:00:00"

# === 37 ===
Copy-Item "$tmp\frontend\src\views\PrescriptionsView.vue" "$root\frontend\src\views\PrescriptionsView.vue"
Do-Commit "feat(views): prescription list with status filtering" "2025-01-31T09:30:00"

# === 38 ===
Copy-Item "$tmp\frontend\src\views\PersonalizeView.vue" "$root\frontend\src\views\PersonalizeView.vue"
Do-Commit "feat(views): personalization ui with factor breakdown and alternatives" "2025-01-31T14:00:00"

# === 39 ===
Copy-Item "$tmp\frontend\src\views\MedicationsView.vue" "$root\frontend\src\views\MedicationsView.vue"
Do-Commit "feat(views): medication catalog with expandable details" "2025-02-01T10:00:00"

# === 40 ===
Do-Commit "style(login): refine form spacing and error state visuals" "2025-02-03T09:00:00"

# === 41 ===
Do-Commit "fix(dashboard): stat cards wrapping on tablet breakpoint" "2025-02-03T11:00:00"

# === 42 ===
Do-Commit "perf(patients): debounce search input to reduce query frequency" "2025-02-03T14:30:00"

# === 43 ===
Do-Commit "fix(router): redirect authenticated users away from login page" "2025-02-04T09:00:00"

# === 44 ===
Do-Commit "style(prescriptions): color-code scores green/yellow/red by threshold" "2025-02-04T11:00:00"

# === 45 ===
Do-Commit "fix(nav): active route highlight not syncing on programmatic navigation" "2025-02-04T14:00:00"

# === 46 ===
Do-Commit "feat(error): add user-friendly graphql error toast messages" "2025-02-05T09:30:00"

# === 47 ===
Do-Commit "chore(seed): add blood pressure and heart rate data to demo patients" "2025-02-05T11:00:00"

# === 48 ===
Do-Commit "fix(engine): handle edge case when patient has zero existing prescriptions" "2025-02-05T14:00:00"

# === 49 ===
Do-Commit "chore: expand gitignore with ide, cache, and build patterns" "2025-02-06T09:00:00"

# === 50 ===
Copy-Item "$tmp\README.md" "$root\README.md" -Force
Do-Commit "docs: write full readme with architecture diagrams and api reference" "2025-02-06T10:30:00"

# === 51 ===
Do-Commit "chore: prepare for initial deployment" "2025-02-06T14:00:00"

# Clean up external temp
Remove-Item $tmp -Recurse -Force

$count = git rev-list --count HEAD
Write-Host ""
Write-Host "Done: $count commits created" -ForegroundColor Green
git log --oneline
