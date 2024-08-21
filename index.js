const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');

///////////////////////////////////////////////////////////////////////////////////////////////// SERVER //////////////////////////////////////////////////////////////////////////////////////

const product = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const productData = JSON.parse(data);
const slugs = productData.map((product) => {
  return slugify(product.productName, {
    lower: true,
  });
});

const replaceTemplate = (temp, data) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, data.productName);
  output = output.replace(/{%IMAGE%}/g, data.image);
  output = output.replace(/{%PRICE%}/g, data.price);
  output = output.replace(/{%FROM%}/g, data.from);
  output = output.replace(/{%NUTRIENTS%}/g, data.nutrients);
  output = output.replace(/{%QUANTITY%}/g, data.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, data.description);
  output = output.replace(/{%ID%}/g, data.id);

  if (!data.organic) {
    output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
  }
  return output;
};

const server = http.createServer((req, res) => {
  const { query, pathname, search } = url.parse(req.url, true);
  //OVERVIEW PAGE
  if (pathname === '/overview' || pathname === '/') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });
    const cardsHtml = productData
      .map((data) => {
        return replaceTemplate(tempCard, data);
      })
      .join('');
    const output = tempOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);
    res.end(output);
  }
  //PRODUCT PAGE
  else if (pathname === '/product') {
    res.writeHead(202, {
      'Content-type': 'text/html',
    });
    const output = replaceTemplate(product, productData[query.id]);
    res.end(output);
  }

  //API PAGE
  else if (pathname === '/api') {
    res.writeHead(202, {
      'Content-type': 'application/json',
    });
    res.end(data);
  }

  //NOT FOUND PAGE
  else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'Hello-world',
    });
    res.end(`<h1>Page not found! </h1>`);
  }
});
const port = process.env.PORT;
server.listen(port, '/', () => {
  console.log(`Listening to request on port ${port}`);
});
