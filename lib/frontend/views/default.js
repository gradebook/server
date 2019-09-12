/* eslint-disable indent */
module.exports = function wrapDefaultLayout({title, loggedIn}, body) {
	return `
	<!DOCTYPE html>
	<html lang="en">

	<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>${title ? `${title} • ` : ''}Aggie Gradebook</title>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
	<link rel="stylesheet" href="/assets/styles.css" />
	</head>
	<body class="grey lighten-3 ${loggedIn ? 'logged-in' : ''}">
		${loggedIn ?
		`<header class="navbar-fixed">
			<nav class="red">
				<div class="nav-wrapper container">
					<a href="/" class="brand-logo">AGGIE GRADEBOOK</a>
					<ul class="right">
						<li><a href="/logout" title="logout"><i class="material-icons">logout</i></a></li>
					</ul>
				</div>
			</nav>
		</header>` : ''
		}
		<div class="valign-wrapper main">
		${body}
		</div>
	</body>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
	<script defer>window.addEventListener('load', () => M.AutoInit())</script>

	</html>`;
};

/* eslint-enable indent */
