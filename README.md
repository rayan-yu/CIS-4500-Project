CIS4500/5500 Group Project: Soccer Analysis Platform

Description of Project:

Our Pro Soccer Analysis Platform is designed to be the go-to solution for soccer fans, sports analysts, and fantasy league players who want to get deeper into the game. Our aim is to offer a tool that goes beyond the basics, providing detailed insights into player performance, team condition, and transfer market possibilities. It's a way to help fantasy league participants make smarter picks, give fans new angles to appreciate their favorite sport, and aid analysts in examining how player movements might change team dynamics. In short, our platform is about understanding soccer on a more profound level through solid data.


Project Directory Breakdown: 
## We used HW2 client/server as our template to start building out our application. A lot of our code is still similar to that code, but we are working on iterating our product and moving farther away from it. ##
We currently have a client and server directory. 

client/src houses our frontend code. We have our code broken down into Pages and reusable components. We have a page for looking at players, a page for looking at teams, a page for looking at competitions, and a homepage, In our components, we have a playerCard and we also have a navvar.

server contains our backend code. We have a routes.js that contains all of our api calls and database queries. We alsi have server.js which has the express handlers.

We also have folders from our two different data sources as well as our google colab with our preprocessed data.

How to run:

Terminal 1

`cd server`

`npm install`

`npm start`

Terminal 2

`cd client`

`npm install`

`npm install firebase`

`npm install firebase react-router-dom`

`npm start`
