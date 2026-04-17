export const generatePortfolioHtml = (resume, user, portfolioAccentColor) => {
    const skills = resume.sections.find(s => s.type === 'skills')?.content?.split(',').map(s => s.trim()) || [];
    const experience = resume.sections.find(s => s.type === 'experience')?.items || [];
    const education = resume.sections.find(s => s.type === 'education')?.items || [];
    const projects = resume.sections.find(s => s.type === 'projects')?.items || [];

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resume.firstName || ''} ${resume.lastName || ''} - Portfolio</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #f0f2f5; color: #333; }
        h1, h2, h3, h4, h5, h6 { font-weight: 700; }
        .section-padding { padding: 80px 0; }
        .section-title { margin-bottom: 50px; }
        html { scroll-behavior: smooth; }
        .navbar { background-color: rgba(255, 255, 255, 0.9); box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: all 0.3s ease; }
        .navbar-brand { font-weight: 700; color: ${portfolioAccentColor} !important; }
        .nav-link { font-weight: 600; color: #555 !important; transition: color 0.3s ease; }
        .nav-link:hover, .nav-link.active { color: ${portfolioAccentColor} !important; }
        #hero { background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://picsum.photos/seed/portfolio/1920/1080') no-repeat center center; background-size: cover; color: white; height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; }
        #hero h1 { font-size: 3.5rem; font-weight: 700; margin-bottom: 20px; }
        #hero p { font-size: 1.5rem; font-weight: 300; margin-bottom: 30px; }
        .btn-hero { font-weight: 600; padding: 12px 30px; border-radius: 50px; transition: all 0.3s ease; background-color: ${portfolioAccentColor}; border-color: ${portfolioAccentColor}; color: white; }
        .btn-hero:hover { transform: translateY(-3px); box-shadow: 0 4px 15px rgba(0,0,0,0.2); background-color: ${portfolioAccentColor}; filter: brightness(0.9); }
        .card { border: none; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); transition: transform 0.3s ease; }
        .card:hover { transform: translateY(-5px); }
        .skill-badge { background-color: white; border: 1px solid #eee; padding: 10px 20px; border-radius: 50px; font-weight: 600; display: inline-block; margin: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        footer { background-color: #343a40; color: white; padding: 40px 0; text-align: center; }
        .social-icons a { font-size: 1.5rem; color: white; margin: 0 10px; transition: color 0.3s ease; }
        .social-icons a:hover { color: ${portfolioAccentColor}; }
    </style>
</head>
<body data-bs-spy="scroll" data-bs-target="#navbar">
    <nav id="navbar" class="navbar navbar-expand-lg fixed-top">
        <div class="container">
            <a class="navbar-brand" href="#">${resume.firstName || ''} ${resume.lastName || ''}</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="#hero">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="#about">About</a></li>
                    <li class="nav-item"><a class="nav-link" href="#skills">Skills</a></li>
                    <li class="nav-item"><a class="nav-link" href="#experience">Experience</a></li>
                    <li class="nav-item"><a class="nav-link" href="#projects">Projects</a></li>
                    <li class="nav-item"><a class="nav-link" href="#contact">Contact</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <section id="hero">
        <div class="container">
            <h1>I'm ${resume.firstName || ''} ${resume.lastName || ''}</h1>
            <p>${resume.title || 'Professional Specialist'}</p>
            <a href="#projects" class="btn btn-hero">View My Work</a>
        </div>
    </section>

    <section id="about" class="section-padding">
        <div class="container">
            <h2 class="text-center section-title">About Me</h2>
            <div class="row justify-content-center">
                <div class="col-lg-8 text-center">
                    <p class="lead">${resume.summary || 'Passionate professional dedicated to excellence and innovation.'}</p>
                </div>
            </div>
        </div>
    </section>

    <section id="skills" class="section-padding bg-light">
        <div class="container">
            <h2 class="text-center section-title">My Skills</h2>
            <div class="text-center">
                ${skills.map(skill => `<div class="skill-badge">${skill}</div>`).join('')}
            </div>
        </div>
    </section>

    <section id="experience" class="section-padding">
        <div class="container">
            <h2 class="text-center section-title">Work Experience</h2>
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    ${experience.map((exp) => `
                        <div class="card mb-4">
                            <div class="card-body p-4">
                                <h5 class="card-title text-primary">${exp.title}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${exp.company} | ${exp.period}</h6>
                                <p class="card-text">${exp.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </section>

    <section id="projects" class="section-padding bg-light">
        <div class="container">
            <h2 class="text-center section-title">Projects</h2>
            <div class="row g-4">
                ${projects.map((proj) => `
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-body p-4">
                                <h5 class="card-title">${proj.name}</h5>
                                <p class="card-text">${proj.description}</p>
                                ${proj.link ? `<a href="${proj.link}" target="_blank" class="btn btn-sm btn-outline-primary">View Project</a>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <section id="contact" class="section-padding">
        <div class="container text-center">
            <h2 class="section-title">Get In Touch</h2>
            <p class="lead mb-4">I'm open to discussing new projects, creative ideas, or opportunities.</p>
            <p class="h4 mb-4"><a href="mailto:${resume.email || user.email}" class="text-decoration-none text-dark">${resume.email || user.email}</a></p>
            <div class="social-icons">
                ${resume.github ? `<a href="${resume.github}" target="_blank"><i class="fab fa-github"></i></a>` : ''}
                ${resume.linkedin ? `<a href="${resume.linkedin}" target="_blank"><i class="fab fa-linkedin-in"></i></a>` : ''}
            </div>
        </div>
    </section>

    <footer>
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${resume.firstName || ''} ${resume.lastName || ''}. All Rights Reserved.</p>
            <p class="small mt-2">Generated with ProPath Career Suite</p>
        </div>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
};
