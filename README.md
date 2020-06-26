
<img  align="left" width="150" style="float: left;" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/CEI/LOGOTIPO%20leyenda%20color%20JPG%20p.png">
<img  align="right" width="150" style="float: right;" src="https://miriadax.net/miriadax-theme/images/custom/logo_miriadax_new.svg">

<br/><br/><br/>
Módulo 4: Recurso usuarios, Autenticación, Autorización y Registro, Autores de Preguntas y Mis Preguntas
Versión: 19 de Junio de 2020

## Objetivos

* Entender el uso de la sesión para guardar valores entre transacciones HTTP.
* Afianzar los conocimientos sobre búsquedas especificas en la BBDD.
* Afianzar sus conocimientos en el uso de Express para desarrollar servidores web.

## Descripción de la práctica

En esta práctica el alumno debe modificar el proyecto **Quiz** desarrollado en la asignatura para que los usuarios jueguen a acertar todos los quizzes existentes en la bases de datos. Los quizzes se presentarán al usuario jugador al azar y sin repetirse. El usuario debe intentar acertar el mayor número de quizzes para obtener la máxima puntuacion.

El juego comenzará con la pregunta de un quiz elegido al azar. Si se acierta, se presentará otra pregunta elegida también al azar, y así sucesivamente. El juego continuará hasta acertar todos los quizzes de la BBDD o hasta fallar una respuesta. El jugador deberá tratar de acertar el número máximo de respuestas.

Para implementar este juego, deben añadirse las siguientes primitivas a la API:

```text
GET /quizzes/randomplay  ## muestra random_play.ejs con una pregunta a contestar  
## o muestra random_nomore.ejs si no quedan preguntas por contestar

GET /quizzes/randomcheck/:quizId?answer=respuesta  
## muestra el resultado con random_result.ejs
```

## Descargar el código del proyecto

Para desarrollar esta práctica es necesario utilizar la **versión 12 de Node.js**.

El alumno debe clonar en su ordenador de trabajo, el repositorio **git** del proyecto **MOOC_quiz_mod4-randomplay_entrega**:

```sh
$ git clone https://github.com/ging-moocs/MOOC_quiz_mod4-randomplay_entrega
```

Este proyecto **MOOC_quiz_mod4-randomplay_entrega** solo contiene los ficheros necesarios para ejecutar el autocorrector. El alumno debe clonar también el repositorio **git** del proyecto **Quiz** desarrollado en la asignatura, en un subdirectorio de **MOOC_quiz_mod4-randomplay_entrega**. El proyecto **Quiz** está disponible en el siguiente repositorio git:

```url
https://github.com/CORE-UPM/quiz_2020
```

Para clonar el proyecto **Quiz** en un subdirectorio dentro del proyecto **MOOC_quiz_mod4-randomplay_entrega**, e instalar las dependencias necesarias, hay que ejecutar: 


```sh
$ cd MOOC_quiz_mod4-randomplay_entrega
$ npm install 
$ git clone https://github.com/CORE-UPM/quiz_2020
$ cd quiz_2020
$ npm install 
```

Tras ejecutar estos comandos, el proyecto **Quiz** se ha instalado en el subdirectorio **quiz\_2020**. El alumno debe trabajar dentro del directorio **quiz\_2020** para realizar las tareas de la entrega.

## Tareas

### Tarea 1 - Crear una rama git

Para realizar esta práctica el alumno debe crear una rama, denominada **randomplay**, en el commit identificado con el tag **2.5\_restoration** ("*Step 2.5: Restoration Routes.*") del proyecto **Quiz**. El último commit de esta rama será la versión de la practica que se evaluará.

Nota: Asegúrese de que se encuentra en el subdirectorio **MOOC_quiz_mod4-randomplay_entrega/quiz\_2020** antes de ejecutar los comandos que se describen más abajo.


El alumno puede crear la rama **randomplay** ejecutando el siguiente comando:

```sh
$ git branch randomplay 2.5_restoration
```

Este comando crea la rama **randomplay** en el commit identificado por el tag **2.5\_restoration**.

Para cambiarse a esta rama, y desarrollar dentro de ella, hay que ejecutar:

```sh
$ git checkout randomplay
```

Para comprobar que se está trabajando en la rama **randomplay**, el alumno puede ejecutar el comando **"git branch"**, que presentará un listado de las ramas existentes, y marcando con un asterisco la rama actual de trabajo.

```sh
$ git branch
* randomplay
master
```

El comando **git checkout** anterior puede fallar si la instalacion de paquetes con "**npm install**" modificó el fichero **package-lock.json**. Si ocurre esto, ejecute **"git checkout package-lock.json"** para restaurar ese fichero a su estado original, y repita el checkout.


El alumno tambien puede crear ramas y cambiar de rama usando las facilidades que le proporcione el IDE que esté utilizando (_Visual Studio Code_, _WebStorm_).

### Tarea 2 - Actualizar la barra de navegación

En esta tarea el alumno debe añadir un enlace en la barra de navegación con el texto **Play**. Hay que pulsar este enlace para empezar a jugar a **Random Play**.

Para ello hay que añadir un nuevo enlace en la barra de navegación implementada en **views/layout.ejs**. El texto del enlace debe ser **Play**, y al pulsarlo debe enviar la solicitud:

```text
GET /quizzes/randomplay
```

### Tarea 3 - Crear Rutas

En esta tarea el alumno debe editar el fichero **routes/index.js** para definir las rutas que atenderán las peticiones:

```text
GET /quizzes/randomplay
GET /quizzes/randomcheck/:quizId
```

Ambas peticiones son de tipo **GET**, luego debe usar **routes.get** para definir ambar rutas.

El primer parámetro de **routes.get** es el path de la petición. En nuestro caso son los strings **"/quizzes/randomplay"** y **"/quizzes/randomcheck/:quizId(\d+)"**.

Aclaración: **":quizId(\d+)"** es un parámetro de ruta por la presencia de los dos puntos. Además, para encajar con el valor usado en la petición, debe estar compuesto solo por uno o más dígitos **(\d+)**.

El segundo parámetro de las definiciones de rutas debe ser el middleware que atiende las peticiones. Estos middlewares deben implementarse en el controlador **controllers/quiz.js**, que los exportará usando los nombres **randomPlay** y **randomCheck**. Es decir, hay que editar el fichero **controllers/quiz.js** para implementar y exportar los métodos middleware **randomPlay** y **randomCheck**.

### Tarea 4 - Actualizar el controlador de Quizzes

El fichero controlador donde se implementan los middlewares relacionados con los quizzes es **controllers/quiz.js**. El alumno debe implementar y exportar en este fichero los middlewares **randomPlay** y **randomCheck**.

#### Tarea 4.1 - Middleware randomPlay

El middleware **randomPlay** debe buscar un quiz al azar en la base de datos, y devolver al cliente la vista **quizzes/random\_play.ejs** con el quiz elegido. Esta vista le mostrará al cliente la pregunta del quiz para que la responda intentando acertar.

La respuesta HTTP que se envía al cliente se construye usando el método **res.render**. Toma como primer parámetro el path relativo de un fichero EJS situado dentro de la carpeta **views**, que en este caso será **"quizzes/random\_play"**. Como segundo parámetro debe pasarse el objeto quiz sacado de la base de datos. 

El fichero **views/quizzes/random\_play.ejs** ya se proporciona hecho. El alumno debe usar este fichero sin modificarlo.

El middleware **randomPlay** no solo debe mostrar la pregunta del primer quiz del juego, sino todas las demás preguntas del juego, una detrás de otra, y renderizarlas siempre con la misma vista.  
Cuando el cliente haya respondido bien a todas las preguntas de la base de datos, el middleware **randomPlay** debe responder renderizando la vista **quizzes/random\_nomore.ejs**, que muestra una página informando de que el juego ha finalizado con éxito. 
El juego **Random Play** no debe repetir la misma pregunta durante una partida. Debe mostrar siempre un quiz diferente, hasta que no quede ningún quiz nuevo que mostrar. Para no repetir las preguntas es necesario guardar los identificadores de los quizzes ya contestados en algún lugar.

HTTP es un protocolo transaccional que no guarda información de los clientes entre transacciones. El alumno debe utilizar la sesión (**req.session**) para guardar un array con los identificadores de los quizzes ya respondidos. Como cada cliente tiene una sesión diferente, varios clientes podrán jugar simultáneamente sin interferir entre si.

Se recomienda crear una propiedad en la sesión **req.session** y guardar en ella un array con los ids de los quizzes contestados anteriormente. El alumno puede llamar a esta propiedad como quiera; en el resto de este enunciado se supondrá que el alumno la llamado **randomPlayResolved**.

Para elegir un nuevo quiz que no haya sido contestado aun, puede usarse una opción **where** y la operación **[Sequelize.Op.notIn]**, indicando que el **id** del quiz no puede estar en **randomPlayResolved**.

```javascript
const quiz = await models.Quiz.findOne({
where: {'id': {[Sequelize.Op.notIn]: req.session.randomPlayResolved}}
});
```

El siguiente quiz a preguntar debe elegirse de forma aleatoria entre los que quedan sin preguntar. En número de quizzes que quedan por contertar el igual al número total de quizzes menos los ya contestados. Puede usarse la opción **offset** para que **findOne** devuelva un quiz al azar, en vez de devolver siempre el primer quiz pendiente por contestar.

```javascript
const total = await models.Quiz.count();
const quedan = total - req.session.randomPlayResolved.length;

const quiz = await models.Quiz.findOne({
where: ????? lo de antes ????,
offset: Math.floor(Math.random() * quedan)
});
```

**Mejora opcional**: Si el cliente no sabe contestar a una pregunta, puede hacer trampas recargando la página actual mostrada por el navegador. La recarga provoca que se envíe una nueva petición **/quizzes/randomplay** al servidor. El servidor elegirá otro quiz al azar de la base de datos y se lo enviará al cliente. El cliente podría hacer esto siempre que no sepa contestar un quiz. Para evitarlo se puede añadir a **req.session** una propiedad llamada por ejemplo **randomPlayLastQuizId**, que guarde el **id** del último quiz eligido. El servidor puede comprobar si existe esta propiedad: Si la propiedad existe, se devuelve el quiz indicado por ella, y si no existe, se elige un nuevo quiz de la base de datos y se guarda su **id** en la propiedad. Esta propiedad se borra cuando el cliente contesta el quiz.

#### Tarea 4.2 - Middleware randomCheck

El formulario de la vista **quizzes/random\_play.ejs** envía la respuesta introducida por el usuario al pulsar el botón "**check**", generando la siguientes petición HTTP:

```text
GET  /quizzes/randomcheck/:quizId?answer=<respuesta>
```

donde **quizId** es el **id** del quiz contestado, y **\<respuesta\>** es el texto de la respuesta introducida por el usuario. 

La ruta que atiende esta petición ya se definió en **routes/index.js**, y falta implementar el middleware **randomCheck** en **controllers/quiz.js**.

Este middleware debe buscar la respuesta correcta del quiz en la base de datos, y comprobar si coincide con la enviada por el usuario. 

Si la respuesta es correcta, el middleware debe:

* Añadir el identificador **id** del quiz al array **req.session.randomPlayResolved**. Conviene comprobar que no se ha añadido ya anteriormente, y evitar así que al recargar esta página se almacene varias veces.
* Calcular la puntuación obtenida hasta el momento en el juego. Será igual a la longitud del array **req.session.randomPlayResolved**.
* Generar la respuesta HTTP usando **res.render** para renderizar la vista **quizzes/random\_result.ejs**. Hay que pasar tres valores: un booleano llamado **result** indicando si se acertó el quiz o no, el string **answer** con la respuesta dada por el usuario, y el entero **score** con los aciertos conseguidos hasta el momento.
* Si se implemento la mejora opcional que evitaba las trampas, también será necesario borrar **req.session.randomPlayLastQuizId**.


Si la respuesta es incorrecta, entonces el juego debe terminar. El middleware debe:

* destruir la propiedad **req.session.randomPlayResolved** para volver al estado inicial,
* y renderizar la vista **quizzes/random\_result.ejs** con los parámetros adecuados.


### Tarea 5 - Las vistas

Para realizar esta práctica deben usarse los 3 ficheros de vistas siguientes sin modificarlos. Estos ficheros se proporcionan en un ZIP después de este enunciado.

La vista **views/quizzes/random\_play.ejs** muestra la pregunta de un quiz y un formulario para que el usuario responda:

```html
<h1>
Random Play:
</h1>

<div>
Successful answers = <span id="score"><%= score %></span>
</div>

<form method="get" action="/quizzes/randomcheck/<%= quiz.id %>">

<p>
Question: <b><%= quiz.question %></b>
</p>


<div class="wideRow">
<input type="text" class="itemWide" id="answer" name="answer" value="" placeholder="Answer" autocomplete="off"/>
<input type="submit" class="itemNarrow" id="send" value="Check">
</div>
</form>

```

La vista **views/quizzes/random\_nomore.ejs** muestra el resultado obtenido al finalizar el juego:

```html
<h1>
End of Random Play:
</h1>

<div>
Successful answers = <span id="score"><%= score %></span>
</div>

<p>
You answered all questions. You are a champion.
</p>

<p>
<a href="/goback" class="button">Go back</a>
</p>

```

La vista **views/quizzes/random\_result.ejs** informa sobre si se contestó correctamente o no al quiz de la vista anterior. Solo permite seguir jugando si se contestó correctamente.

```html
<h1>
Random Play:
</h1>

<p>
Successful answers = <span id="score"><%= score %></span>
</p>

<p>
The answer <strong> <%= answer %> </strong> is <%= result ? 'right' : 'wrong' %>.
</p>

<% if (!result) { %>
<p>
You have failed.
</p>
<p>
<a href="/goback" class="button">End of Play</a>
</p>

<% } else { %>
<p>
You have succeeded.
</p>
<p>
<a href="/quizzes/randomplay" class="button">Continue playing</a>
</p>
<% } %>

```

### A jugar

El alumno debe probar el correcto funcionamiento de la entrega lanzando el servidor con el comando **"npm super"**, y visitando la URL **http://localhost:3000** desde un navegador. Debe pulsar el enlace **Jugar** en la barra de navegación y comprobar el correcto funcionamiento de todos los requisitos de la práctica.

Antes de lanzar el servidor debe aplicar las migraciones pendientes ejecutando:

```sh
$ npm run migrate 
```

Nota: o **migrate\_win** para Windows.

Si no ha ejecutado nunca los seeders, ejecute:

```sh
$ npm run seed 
```

Nota: o **seed\_win** para Windows.

### Congelar los cambios

Cuando el alumno haya terminado la práctica, o siempre que lo considere oportuno, debe congelar una versión del trabajo realizado:

```sh
$ git add views/layout.ejs
$ git add routes/index.js
$ git add views/quizzes/random_play.ejs
$ git add views/quizzes/random_nomore.ejs
$ git add views/quizzes/random_result.ejs
$ git add controllers/quiz.js
$ git commit
```

## Prueba de la práctica 

Para ayudar al desarrollo, se provee una herramienta de autocorrección que prueba las distintas funcionalidades que se piden en el enunciado. Para utilizar esta herramienta debes tener node.js (y npm) ([https://nodejs.org/es/](https://nodejs.org/es/)) y Git instalados. 

Para instalar y hacer uso de la [herramienta de autocorrección](https://www.npmjs.com/package/moocauto) en el ordenador local, ejecuta los siguientes comandos en el directorio del proyecto:

```
$ npm install -g moocauto     ## Instala el programa de test
$ moocauto                    ## Pasa los tests al fichero a entregar
............................  ## en el directorio de trabajo
... (resultado de los tests)
```
También se puede instalar como paquete local, en el caso de que no se dispongas de permisos en el ordenador desde el que estás trabajando:
```
$ npm install moocauto         ## Instala el programa de test
$ npx moocauto                 ## Pasa los tests al fichero a entregar
............................   ## en el directorio de trabajo
... (resultado de los tests)
```

Se puede pasar la herramienta de autocorrección tantas veces como se desee.


A la hora de evaluar, el evaluador tendrá que seguir los siguientes criterios:

**RÚBRICA:** Se puntuará el ejercicio a corregir sumando el % indicado a la nota total si la parte indicada es correcta:

* **10%:** Existe la rama "entrega8".
* **10%:** Se muestra la puntuación correcta tras cada respuesta.
* **20%:** Los quizzes se eligen aleatoriamente.
* **20%:** No se repiten los quizzes.
* **20%:** Se termina si no quedan más quizzes.
* **10%:** Si se responde bien, continúa el juego.
* **10%:** Al fallar se termina el juego.
