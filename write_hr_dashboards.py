from pathlib import Path

hr1 = '''<!DOCTYPE html>
<html lang="en">
<head>
    {{> head}}
    <title>HR Dashboard - HuntJob</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f3f4f6;
            color: #111827;
            min-height: 100vh;
            overflow-x: hidden;
            padding-top: 60px;
        }
        .page-shell {
            display: flex;
            min-height: calc(100vh - 60px);
        }
        .page-main {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem 1.5rem 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        .hero {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1.75rem 2rem;
            border-radius: 1.25rem;
            background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
            color: white;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
            margin-bottom: 1.5rem;
        }
        .hero h1 {
            font-size: 2.25rem;
            line-height: 1.05;
            margin-bottom: 0.5rem;
        }
        .hero p {
            max-width: 42rem;
            font-size: 1rem;
            color: rgba(255,255,255,0.92);
            line-height: 1.75;
        }
        .hero-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
        }
        .hero-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 12rem;
            padding: 0.85rem 1rem;
            border-radius: 999px;
            font-weight: 700;
            text-decoration: none;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            color: white;
        }
        .hero-action:hover { transform: translateY(-2px); }
        .hero-action.primary { background: rgba(255,255,255,0.15); }
        .hero-action.accent { background: rgba(255,255,255,0.2); }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .stat-card {
            background: white;
            padding: 1.4rem 1.5rem;
            border-radius: 1rem;
            border-left: 5px solid #10b981;
            box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
        }
        .stat-card h3 {
            font-size: 0.95rem;
            color: #4b5563;
            margin-bottom: 0.75rem;
            font-weight: 700;
        }
        .stat-card .number {
            font-size: 2.1rem;
            font-weight: 900;
            color: #111827;
            margin-bottom: 0.25rem;
        }
        .stat-card .label {
            color: #6b7280;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .content-grid {
            display: grid;
            grid-template-columns: 1.9fr 1fr;
            gap: 1.25rem;
        }
        @media (max-width: 1024px) {
            .content-grid { grid-template-columns: 1fr; }
        }
        .card {
            background: white;
            border-radius: 1.2rem;
            box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
            overflow: hidden;
        }
        .card-header {
            padding: 1.4rem 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f8fafc;
        }
        .card-header h2 {
            font-size: 1.2rem;
            margin: 0;
            color: #111827;
        }
        .card-body {
            padding: 1.5rem;
        }
        .application-list {
            display: grid;
            gap: 1px;
            background: #e5e7eb;
        }
        .application-item {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: space-between;
            align-items: center;
            padding: 1.25rem 1.5rem;
            background: white;
            transition: background 0.2s ease;
        }
        .application-item:hover { background: #f8fafc; }
        .application-preview {
            display: flex;
            align-items: center;
            gap: 1rem;
            min-width: 0;
        }
        .application-preview img {
            width: 3.25rem;
            height: 3.25rem;
            border-radius: 9999px;
            object-fit: cover;
            background: #d1d5db;
        }
        .application-preview h3 {
            margin: 0;
            font-size: 1rem;
            color: #111827;
        }
        .application-preview p {
            margin: 0.35rem 0 0 0;
            color: #6b7280;
            font-size: 0.92rem;
        }
        .application-meta {
            text-align: right;
            min-width: 10rem;
        }
        .application-meta p {
            margin: 0.3rem 0 0 0;
            color: #6b7280;
            font-size: 0.86rem;
        }
        .status-pill {
            display: inline-flex;
            align-items: center;
            padding: 0.4rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.78rem;
            font-weight: 700;
        }
        .status-submitted { background: #fef3c7; color: #92400e; }
        .status-review { background: #dbeafe; color: #1e40af; }
        .status-shortlisted { background: #ede9fe; color: #6d28d9; }
        .status-interview { background: #fee2e2; color: #b45309; }
        .status-hired { background: #dcfce7; color: #166534; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .widget-stack {
            display: grid;
            gap: 1rem;
        }
        .widget-card {
            display: grid;
            gap: 0.75rem;
            padding: 1.4rem;
            border-radius: 1rem;
            background: white;
            box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
        }
        .widget-card h3 {
            margin: 0;
            font-size: 1rem;
            color: #111827;
        }
        .widget-card p { margin: 0; color: #6b7280; font-size: 0.92rem; }
        .widget-list {
            display: grid;
            gap: 0.75rem;
        }
        .widget-item {
            padding: 1rem 1.1rem;
            border-radius: 0.95rem;
            background: #f8fafc;
            border-left: 4px solid #3b82f6;
        }
        .widget-item p { margin: 0; }
        .widget-item .title { font-size: 0.96rem; font-weight: 700; color: #111827; }
        .widget-item .meta { color: #6b7280; font-size: 0.85rem; margin-top: 0.35rem; }
        .button-list {
            display: grid;
            gap: 0.75rem;
        }
        .button-list a {
            display: block;
            padding: 0.95rem 1rem;
            border-radius: 0.95rem;
            text-align: center;
            font-weight: 700;
            text-decoration: none;
            color: white;
            transition: transform 0.2s ease;
        }
        .button-list a:hover { transform: translateY(-1px); }
        .btn-primary { background: #0f766e; }
        .btn-secondary { background: #2563eb; }
        .btn-warning { background: #f59e0b; }
        .btn-accent { background: #8b5cf6; }
        .empty-state {
            padding: 2rem;
            text-align: center;
            color: #6b7280;
        }
        .empty-state a { color: #0f766e; text-decoration: none; font-weight: 700; }
    </style>
</head>
<body>
{{> navbar}}
<div class="page-shell">
    {{> sidebar-hr}}
    <main class="page-main">
        <section class="hero">
            <div>
                <h1>HR Dashboard</h1>
                <p>Track jobs, review applications, and keep your hiring pipeline moving smoothly.</p>
            </div>
            <div class="hero-actions">
                <a href="/hr/job-form" class="hero-action primary">➕ Post Job</a>
                <a href="/hr/applications-list" class="hero-action accent">📝 Review Applicants</a>
                <a href="/hr/reports" class="hero-action accent">📊 See Reports</a>
            </div>
        </section>

        <section class="stats-grid">
            <article class="stat-card" style="border-left-color: #3b82f6;">
                <h3>Open Jobs</h3>
                <p class="number">{{stats.openJobs}}</p>
                <p class="label">Active municipality positions</p>
            </article>
            <article class="stat-card" style="border-left-color: #10b981;">
                <h3>Pending Review</h3>
                <p class="number">{{stats.pendingReview}}</p>
                <p class="label">Waiting for screening</p>
            </article>
            <article class="stat-card" style="border-left-color: #f59e0b;">
                <h3>Applications</h3>
                <p class="number">{{stats.totalApplications}}</p>
                <p class="label">Total candidates this period</p>
            </article>
            <article class="stat-card" style="border-left-color: #8b5cf6;">
                <h3>Hired</h3>
                <p class="number">{{stats.hired}}</p>
                <p class="label">Successful placements</p>
            </article>
        </section>

        <div class="content-grid">
            <section class="card">
                <div class="card-header">
                    <h2>Latest Applications</h2>
                </div>
                <div class="card-body">
                    <div class="application-list">
                        {{#if recentApplications}}
                            {{#each recentApplications}}
                            <div class="application-item">
                                <div class="application-preview">
                                    <img src="{{#if this.applicant.profilePhoto}}{{this.applicant.profilePhoto}}{{else}}/assets/default-avatar.png{{/if}}" alt="Applicant profile">
                                    <div>
                                        <h3>{{this.applicant.firstName}} {{this.applicant.lastName}}</h3>
                                        <p>{{this.job.title}}</p>
                                    </div>
                                </div>
                                <div class="application-meta">
                                    {{#if (eq this.status 'submitted')}}<span class="status-pill status-submitted">⏳ Submitted</span>{{/if}}
                                    {{#if (eq this.status 'under_review')}}<span class="status-pill status-review">🔍 Under Review</span>{{/if}}
                                    {{#if (eq this.status 'shortlisted')}}<span class="status-pill status-shortlisted">⭐ Shortlisted</span>{{/if}}
                                    {{#if (eq this.status 'interview')}}<span class="status-pill status-interview">🎤 Interview</span>{{/if}}
                                    {{#if (eq this.status 'hired')}}<span class="status-pill status-hired">✓ Hired</span>{{/if}}
                                    {{#if (eq this.status 'rejected')}}<span class="status-pill status-rejected">✗ Rejected</span>{{/if}}
                                    <p>{{formatDate this.createdAt}}</p>
                                    <p><a href="/hr/application-detail/{{this.id}}">Review →</a></p>
                                </div>
                            </div>
                            {{/each}}
                        {{else}}
                            <div class="empty-state">
                                <p>No applications yet. Create a job posting to start receiving candidates.</p>
                            </div>
                        {{/if}}
                    </div>
                </div>
            </section>

            <aside class="widget-stack">
                <div class="widget-card">
                    <h3>Quick Actions</h3>
                    <div class="button-list">
                        <a href="/hr/job-form" class="btn-primary">➕ Post New Job</a>
                        <a href="/hr/applications-list" class="btn-secondary">📋 Review Applications</a>
                        <a href="/hr/schedule-interview" class="btn-warning">📅 Schedule Interview</a>
                        <a href="/hr/reports" class="btn-accent">📈 View Reports</a>
                    </div>
                </div>

                <div class="widget-card">
                    <h3>Recent Notifications</h3>
                    <div class="widget-list">
                        {{#if notifications}}
                            {{#each notifications}}
                            <div class="widget-item">
                                <p class="title">{{this.title}}</p>
                                <p class="meta">{{this.message}}</p>
                                <p class="meta">{{formatDate this.createdAt}}</p>
                            </div>
                            {{/each}}
                        {{else}}
                            <div class="empty-state">
                                <p>No notifications yet.</p>
                            </div>
                        {{/if}}
                    </div>
                </div>

                <div class="widget-card">
                    <h3>Application Overview</h3>
                    <div class="widget-list">
                        <div class="widget-item"><p class="title">Shortlisted</p><p class="meta">{{stats.shortlisted}}</p></div>
                        <div class="widget-item"><p class="title">In Interview</p><p class="meta">{{stats.interview}}</p></div>
                        <div class="widget-item"><p class="title">Hired</p><p class="meta">{{stats.hired}}</p></div>
                        <div class="widget-item"><p class="title">Rejected</p><p class="meta">{{stats.rejected}}</p></div>
                    </div>
                </div>
            </aside>
        </div>
    </main>
</div>
</body>
</html>
'''

hr2 = '''<!DOCTYPE html>
<html lang="en">
<head>
    {{> head}}
    <title>HR Dashboard 2.0 - HuntJob</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #eef2ff;
            color: #111827;
            min-height: 100vh;
            overflow-x: hidden;
            padding-top: 60px;
        }
        .dashboard-shell {
            display: flex;
            min-height: calc(100vh - 60px);
        }
        main {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem 1.5rem 2rem;
            max-width: 1380px;
            margin: 0 auto;
        }
        .hero {
            display: grid;
            gap: 1.5rem;
            padding: 2rem;
            border-radius: 1.5rem;
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            color: white;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
            margin-bottom: 1.5rem;
        }
        .hero h1 {
            font-size: 2.4rem;
            line-height: 1.05;
            margin-bottom: 0.5rem;
        }
        .hero p {
            font-size: 1rem;
            line-height: 1.75;
            max-width: 44rem;
            opacity: 0.95;
        }
        .hero-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.85rem;
        }
        .hero-actions a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.95rem 1.2rem;
            border-radius: 999px;
            font-weight: 700;
            text-decoration: none;
            color: white;
            background: rgba(255,255,255,0.18);
            transition: transform 0.2s ease, background 0.2s ease;
        }
        .hero-actions a:hover { transform: translateY(-2px); background: rgba(255,255,255,0.28); }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .stat-card {
            background: white;
            border-radius: 1.15rem;
            padding: 1.4rem 1.5rem;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            border-left: 5px solid #2563eb;
            transition: transform 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-card h3 { font-size: 0.95rem; color: #475569; margin-bottom: 0.8rem; font-weight: 700; }
        .stat-card .number { font-size: 2rem; font-weight: 900; color: #111827; margin-bottom: 0.35rem; }
        .stat-card .label { color: #6b7280; font-size: 0.87rem; font-weight: 600; }
        .button-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
            gap: 0.85rem;
            margin-bottom: 1.5rem;
        }
        .button-row a {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            padding: 0.95rem 1rem;
            border-radius: 1rem;
            text-decoration: none;
            color: white;
            font-weight: 700;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .button-row a:hover { transform: translateY(-1px); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1); }
        .btn-blue { background: #2563eb; }
        .btn-yellow { background: #f59e0b; }
        .btn-green { background: #10b981; }
        .btn-purple { background: #8b5cf6; }
        .layout-grid {
            display: grid;
            grid-template-columns: 1.95fr 1fr;
            gap: 1.25rem;
        }
        @media (max-width: 1024px) { .layout-grid { grid-template-columns: 1fr; } }
        .card {
            background: white;
            border-radius: 1.2rem;
            overflow: hidden;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        }
        .card-header {
            padding: 1.4rem 1.5rem;
            background: #f8fafc;
            border-bottom: 1px solid #e5e7eb;
        }
        .card-header h2 { margin: 0; font-size: 1.2rem; color: #111827; }
        .card-body { padding: 1.5rem; }
        .application-table {
            display: grid;
            gap: 1px;
            background: #e5e7eb;
        }
        .application-row {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 1rem;
            padding: 1.25rem 1.5rem;
            align-items: center;
            background: white;
        }
        .application-row:hover { background: #f8fafc; }
        .application-details {
            display: flex;
            align-items: center;
            gap: 1rem;
            min-width: 0;
        }
        .avatar {
            width: 3.2rem;
            height: 3.2rem;
            border-radius: 9999px;
            object-fit: cover;
            background: #e5e7eb;
        }
        .application-info h3 { margin: 0; font-size: 1rem; color: #111827; }
        .application-info p { margin: 0.35rem 0 0 0; color: #6b7280; font-size: 0.92rem; }
        .application-meta { text-align: right; display: grid; gap: 0.35rem; }
        .application-meta a { color: #2563eb; text-decoration: none; font-weight: 700; font-size: 0.95rem; }
        .summary-list { display: grid; gap: 0.85rem; margin-top: 1rem; }
        .summary-item {
            padding: 1rem 1.15rem;
            border-radius: 1rem;
            background: #f8fafc;
            border-left: 4px solid #2563eb;
        }
        .summary-item h3 { margin: 0; font-size: 0.97rem; color: #111827; }
        .summary-item p { margin: 0.45rem 0 0 0; color: #6b7280; font-size: 0.92rem; }
        .notification-item {
            padding: 1rem 1.15rem;
            border-radius: 1rem;
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
        }
    </style>
</head>
<body>
    {{> navbar}}
    <div class="dashboard-shell">
        {{> sidebar-manager}}
        <main>
            <section class="hero">
                <div>
                    <h1>HR Dashboard 2.0</h1>
                    <p>Manage applications, jobs, and hiring across departments with one modern command center.</p>
                </div>
                <div class="hero-actions">
                    <a href="/hr2.0/applications-list" class="btn-blue">📝 All Applications</a>
                    <a href="/hr2.0/my-jobs" class="btn-green">📋 My Jobs</a>
                    <a href="/hr2.0/notifications" class="btn-yellow">🔔 Notifications</a>
                    <a href="/hr2.0/reports" class="btn-purple">📊 Reports</a>
                </div>
            </section>

            <div class="stats-grid">
                <article class="stat-card" style="border-left-color: #3b82f6;">
                    <h3>Open Jobs</h3>
                    <p class="number">{{stats.openJobs}}</p>
                    <p class="label">Active postings</p>
                </article>
                <article class="stat-card" style="border-left-color: #10b981;">
                    <h3>Total Applications</h3>
                    <p class="number">{{stats.totalApplications}}</p>
                    <p class="label">Submitted candidates</p>
                </article>
                <article class="stat-card" style="border-left-color: #f59e0b;">
                    <h3>Pending Review</h3>
                    <p class="number">{{stats.pendingReview}}</p>
                    <p class="label">Need your attention</p>
                </article>
                <article class="stat-card" style="border-left-color: #8b5cf6;">
                    <h3>Shortlisted</h3>
                    <p class="number">{{stats.shortlisted}}</p>
                    <p class="label">Top candidates</p>
                </article>
            </div>

            <div class="button-row">
                <a href="/hr2.0/applications-list?status=submitted,under_review" class="btn-yellow">⏳ Pending Review</a>
                <a href="/hr2.0/my-jobs" class="btn-green">📋 My Jobs</a>
                <a href="/hr2.0/notifications" class="btn-blue">🔔 Notifications</a>
                <a href="/hr2.0/reports" class="btn-purple">📈 Performance</a>
            </div>

            <div class="layout-grid">
                <section class="card">
                    <div class="card-header">
                        <h2>Latest Applications</h2>
                    </div>
                    <div class="card-body">
                        <div class="application-table">
                            {{#if recentApplications}}
                                {{#each recentApplications}}
                                <div class="application-row">
                                    <div class="application-details">
                                        <img class="avatar" src="{{#if applicant.profilePhoto}}{{applicant.profilePhoto}}{{else}}/assets/default-avatar.png{{/if}}" alt="Applicant photo">
                                        <div class="application-info">
                                            <h3>{{applicant.firstName}} {{applicant.lastName}}</h3>
                                            <p>{{job.title}} · {{job.department}}</p>
                                        </div>
                                    </div>
                                    <div class="application-meta">
                                        {{#if (eq status "submitted")}}<span class="status-pill status-submitted">Pending</span>{{else if (eq status "under_review")}}<span class="status-pill status-review">Under Review</span>{{else if (eq status "shortlisted")}}<span class="status-pill status-shortlisted">Shortlisted</span>{{else if (eq status "interview")}}<span class="status-pill status-interview">Interview</span>{{else if (eq status "hired")}}<span class="status-pill status-hired">Hired</span>{{else if (eq status "rejected")}}<span class="status-pill status-rejected">Rejected</span>{{/if}}
                                        <p>{{formatDate createdAt}}</p>
                                        <a href="/hr/application-detail/{{id}}">Review →</a>
                                    </div>
                                </div>
                                {{/each}}
                            {{else}}
                                <div class="empty-state">
                                    <p>No recent applications yet. Post a job to get started.</p>
                                </div>
                            {{/if}}
                        </div>
                    </div>
                </section>

                <aside>
                    <div class="summary-list">
                        <div class="summary-item">
                            <h3>Under Review</h3>
                            <p>{{stats.pendingReview}}</p>
                        </div>
                        <div class="summary-item">
                            <h3>Shortlisted</h3>
                            <p>{{stats.shortlisted}}</p>
                        </div>
                        <div class="summary-item">
                            <h3>Interview</h3>
                            <p>{{stats.interview}}</p>
                        </div>
                        <div class="summary-item">
                            <h3>Hired</h3>
                            <p>{{stats.hired}}</p>
                        </div>
                        <div class="summary-item">
                            <h3>Rejected</h3>
                            <p>{{stats.rejected}}</p>
                        </div>
                    </div>
                    <div class="summary-list">
                        <div class="notification-item">
                            <h3>Recent Notifications</h3>
                        </div>
                        {{#if notifications}}
                            {{#each notifications}}
                            <div class="notification-item">
                                <h3>{{this.title}}</h3>
                                <p>{{this.message}}</p>
                                <p style="font-size:0.85rem;color:#475569;margin-top:0.6rem;">{{formatDate this.createdAt}}</p>
                            </div>
                            {{/each}}
                        {{else}}
                            <div class="notification-item">
                                <p>No notifications yet. Activity will appear here.</p>
                            </div>
                        {{/if}}
                    </div>
                </aside>
            </div>
        </main>
    </div>
</body>
</html>
'''

Path('views/hr/dashboard.xian').write_text(hr1, encoding='utf-8')
Path('views/hr2.0/dashboard.xian').write_text(hr2, encoding='utf-8')
print('done')
