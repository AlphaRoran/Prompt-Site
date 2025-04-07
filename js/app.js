<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Prompt Engineering Master</title>
  <!-- Bootstrap CSS -->
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
    rel="stylesheet"
  />
  <!-- Google Font -->
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap"
    rel="stylesheet"
  />
  <!-- Custom CSS -->
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="light-mode">
  <!-- Navigation Bar -->
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold" href="#">PromptMaster</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navContent"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" href="#prompt-builder">Prompt Builder</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#template-library">Templates</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#agent-factory">Agent Factory</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#library">Library</a>
          </li>
        </ul>
        <button id="theme-toggle" class="btn btn-outline-secondary me-2">
          Toggle Dark Mode
        </button>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <div class="container my-4" id="content">
    <!-- Content will be injected here by app.js -->
  </div>

  <!-- Footer -->
  <footer class="bg-light text-center py-3 mt-4">
    <div class="container">
      <small>&copy; 2025 PromptMaster. All rights reserved.</small>
    </div>
  </footer>

  <!-- Bootstrap JS Bundle -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Custom JS -->
  <script src="js/app.js"></script>
</body>
</html>
