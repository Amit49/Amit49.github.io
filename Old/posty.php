<html>
<head><title>Test</title></head>
<script>
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/pjm/posty.php");
    xhr.setRequestHeader("Content-Type", "text/plain");
    xhr.send("@/etc/passwd");
</script>
<body>
<p>Full POST body received:</p>
<pre><?php echo htmlentities(file_get_contents('php://input')); ?></pre>
</body>
</html>
