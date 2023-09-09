// @ts-check
const template = `
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>Gradebook</title>
	<style>
	body {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		display: grid;
		place-items: center;
		height: 100vh;
		text-align: center;
		background-color: #f5eff2 !important
	}

	.card {
		background: white;
		padding: 4rem;
		border-radius: 1rem;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}

	pre {
		text-align: left;
	}
	</style>
</head>
<body>
	__BODY__
</body>
</html>`.replaceAll(/\n\s*/g, '');

export default function wrapDefaultLayout(_, body) {
	return template.replace('__BODY__', body);
}
