import { CanIUseData } from '../common';

const template = (data: CanIUseData) => `
<!DOCTYPE html>
<html>
<head>
    <title>${data.title}</title>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
<section>
    <h1><a href="${data.spec}">${data.title}</a></h1>
    <p>${data.description}</p>
</section>
<section>
    <h2>Notes</h2>
    <p>${data.notes}</p>
</section>
</body>
</html>
`;

export default template;
