# ¿Cómo integrar tu Botón de pagos Bold manualmente?
¿Cómo integrar tu Botón de pagos Bold manualmente?
--------------------------------------------------

En esta guía se explica cómo añadir a tu sitio web un botón de pagos **con el diseño de Bold** que se ve como el siguiente:



* Redirección: Al hacer clic en el botón de pagos, tus clientes serán dirigidos de manera segura a la Pasarela de Pagos de Bold.
  * Embedded Checkout: Haz que tus clientes paguen de forma rápida y sencilla, sin salir de tu página web con la Pasarela de Pagos de Bold.
* Redirección: 
  * Embedded Checkout: 


Podrán completar sus pagos de forma segura y con todos los medios de pago que ofrece Bold.

!Botón y pasarela de pagos Bold

El Botón de pagos Bold está pensado para varios tipos de escenario como podrían ser los siguientes:

*   Recibir donaciones
*   Venta de productos individuales
*   Pago de servicios o suscripciones

El botón puede configurarse para recibir pagos por:

*   **Monto definido** (tú decides el valor a pagar)
*   **Monto no definido** (tu cliente decide cuánto quiere pagarte)

!info

Si prefieres añadir un botón con un diseño personalizado debes seguir esta otra guía.

!info

Si quieres integrar Bold en el carrito de compra de tu tienda en línea, te sugerimos revisar nuestras integraciones para los ecommerce más populares.

!warning

Esta integración no está disponible para Google Sites, GoDaddy Website Builder y Wix.

Los sitios que encierren nuestro botón en un iframe no podrán usarlo y generará errores en la integración.

Requisitos previos[](#requisitos-previos)
-----------------------------------------

!info

Para una mejor comprensión de esta guía se requieren conocimientos técnicos básicos en:

*   HTML y JavaScript
*   Consumo de APIs
*   Comunicación entre backend y frontend

  

*   Para realizar cualquier integración con Bold necesitas primero un par de llaves de integración asociadas a tu comercio. Puedes leer toda la información referente a las mismas y cómo obtenerlas en esta guía.
*   Además, debes poder modificar el código de tu sitio web.
*   En el caso de querer realizar una integración por un monto definido debes disponer de un backend con capacidad de inyectar datos en el frontend o de generar el mismo (p.ej. PHP o un framework con renderizado desde el servidor).

Integración[](#integración)
---------------------------

A continuación te explicamos en detalle cómo puedes integrar el Botón de pagos Bold en tu sitio web.

### 1\. Integra el botón en tu sitio web[](#1-integra-el-botón-en-tu-sitio-web)

Para que se muestre el Botón de Pagos Bold en tu sitio web basta con realizar 2 sencillos pasos:

1.  Añadir al head:

```
<script src="https://checkout.bold.co/library/boldPaymentButton.js"></script>
```


2.  Añadir un script como el del ejemplo que se indica más abajo (debes poder incluir Javascript en tu sitio) en el lugar donde quieras que se muestre el botón. Ese aparecerá automáticamente donde hayas indicado en el código.
    
    La configuración del botón se realiza por medio de una serie de atributos que se corresponden con los datos de la venta indicados en el paso anterior.
    
    El siguiente ejemplo tiene los atributos mínimos necesarios para generar un botón que permita a tu cliente pagar a través de Bold, el cliente elige el monto a pagar.
    
    ```
<script
  data-bold-button
  data-api-key="LLAVE_DE_IDENTIDAD"
></script>
```

    

!success

Idealmente se recomienda que el botón se encuentre dentro de un formulario para aportarle un sentido semántico. Puedes incluir tantos botones como quieras en un mismo documento

!info

Si no puedes editar el head de tu sitio web tienes la opción de incluir `src="https://checkout.bold.co/library/boldPaymentButton.js"` entre los atibutos del script del botón de pagos.

Si estás añadiendo el botón de pagos a un sitio web construido con React u otros frameworks similares debes asegurarte de inyectar en el head **una vez el script del botón se encuentre en el DOM**.

Algunas cosas que debes tener en cuenta son las siguientes:

*   Cada atributo debe comenzar con el prefijo data- seguido de uno de los datos indicados en el paso anterior (p.ej. data-order-id, data-currency, data-amount, etc.) y usar guiones (-) en vez de guiones bajos (\_) para los nombres de los datos.
    
*   El atributo data-tax recibe 3 tipos de impuestos asi: data-tax=“vat-5”, data-tax=“vat-19” o data-tax=“consumption”), si el impuesto no aplica, debes retirar el atributo por completo.
    
*   El atributo data-bold-button es necesario para que el botón se muestre correctamente. Además, este sirve para configurar los estilos del botón como se indica a continuación:
    
    *   Puedes elegir entre 2 colores y 3 tamaños distintos como se muestra en la imagen:
        
        !Button types
        
          
        
    *   Si no se le asigna ningún valor al atributo, se mostrará por defecto el botón en tamaño L y con los colores de Bold.
        
    *   Para aplicar un color y tamaño concreto a tu botón de pagos debes utilizar una combinación de los siguientes valores:
        
        *   “dark” o “light” para un botón con los colores de Bold o claro respectivamente.
            
        *   “S”, “M” o “L” (en mayúsculas) para el tamaño del botón.
            
            Por ejemplo:
            
            data-bold-button=”dark-S” mostraría el botón con los colores de Bold y en el tamaño más pequeño.
            
            data-bold-button=”light-M” mostraría el botón en color claro y en el tamaño intermedio.
            
    *   Incluir la información del comprador, serán precargados en el formulario de pago de nuestra pasarela de pagos, facilitando al comprador no volver a digitar su información si desde tu integración ya solicitaste sus datos.
        
        *   Para incluir los datos basicos puedes usar el atributo data-customer-data que recibe un objeto convertido a string asi `'{"email": "example@correo.com","fullName": "Lola Flores","phone": "3040777777","dialCode": "+57","documentNumber": "123456789","documentType": "CC"}'`, todos los datos son opcionales.
        *   Para incluir los datos de ubicación puedes usar el atributo data-billing-address que recibe un objeto convertido a string asi `'{"address": "Calle 123 # 4-5","zipCode": "123456","city": "Bogota","state": "Cundinamarca","country": "CO"}'`, todos los datos son opcionales.

##### Ejemplos:

Un ejemplo muy simple para tener un botón sin monto definido, donde el comprador digita el valor a pagar, es el siguiente:

```
<script
  data-bold-button
  data-api-key="LLAVE_DE_IDENTIDAD"
  data-description="Pago de mi reserva dinámica"
  data-redirection-url="https://micomercio.com/pagos/resultado"
></script>
```


### 2\. Obtén tus llaves de integración[](#2-obtén-tus-llaves-de-integración)

Como se explica en la sección de **llaves de integración**, es requisito indispensable que obtengas tus llaves de integración para poder integrarte con las soluciones de Bold, incluido el botón de pagos.

Una vez dispongas de tus llaves, puedes continuar con el proceso.

### 3\. Genera un identificador único para cada venta[](#3-genera-un-identificador-único-para-cada-venta)

!info

El identificador es opcional si no se define el atributo **amount** y se asignará uno automáticamente al iniciar el pago, de lo contrario es necesario para generar el hash de integridad.

Cuando tus clientes compren en tu sitio web, es esencial que puedas realizar el seguimiento de cada una de tus ventas. Para ello, se debe generar un identificador único para cada orden de compra (del mismo modo que harías para emitir una factura).

Este enfoque permite realizar un seguimiento preciso de todas tus ventas hechas a través de Bold.

Nuestra sugerencia es utilizar identificadores numéricos o alfanuméricos, los cuales pueden incluir o no guiones (-) o guiones bajos (\_). A continuación, se presentan ejemplos de identificadores válidos:

*   202212345
*   ord7890
*   INV2023-1001
*   d4e5f6-a1b2c3d4e5f6-g7h8i9
*   j1k2l3\_m4n5o6

!info

Por lo general, los e-commerce más populares generan automáticamente identificadores únicos para cada orden de compra y gestionan este proceso para evitar duplicidades.  
Sin embargo, si tu sitio web está construido de forma personalizada, será necesario que crees la lógica para generar el identificador de la venta y asegurar que este sea único, puedes utilizar una marca de tiempo en **timestamp** al final del identificador de la orden y asi evitar problemas por duplicidad.

!warning

Es clave que los identificadores sean únicos para mantener un registro preciso y prevenir duplicaciones no deseadas, así como posibles conflictos en tu sistema.

Evita reutilizar identificadores que ya estén en tu base de datos ya que se podría generar un error al intentar abrir la pasarela de pagos de Bold si se usa un identificador asociado a una orden de compra ya pagada.

Si el pago no se completó de manera exitosa podrías reutilizar el identificador, pero nuestra recomendación es que siempre generes uno nuevo para cada venta.

### 4\. Genera un hash de integridad[](#4-genera-un-hash-de-integridad)

Para garantizar **la integridad de los datos relativos a cada venta** se hace uso de un hash criptográfico.

Este solo es necesario generarlo si en tu botón defines el monto de la compra en el atributo **amount**, de lo contrario puede omitirlo.

Para generar este hash, necesitarás la **llave secreta** que obtuviste en el paso 1.

!warning

Te recordamos que esta llave es privada. Solo tú debes conocerla y guardarla en tu servidor.

Usando esta llave secreta deberás generar un hash SHA256 con la siguiente información:

1.  Identificador único de la venta
2.  Monto de la transacción
3.  Divisa de la transacción
4.  Llave secreta

Debes concatenar la información anterior de tal manera que obtengas una cadena de texto como la siguiente:

```
{Identificador}{Monto}{Divisa}{LlaveSecreta}
```


Aquí te mostramos un ejemplo para los siguientes valores:

Identificador único de la venta: inv0334

Monto de la transacción: 39400

Divisa de la transacción: COP

Llave secreta: kgfq2nN0o52XqnuXZWIN2F

```
inv033439400COPkgfq2nN0o52XqnuXZWIN2F
```


!warning

El orden de esta información es crucial a la hora de generar el hash.

!info

**Monto abierto**  
Si en vez de un monto fijo quieres que tu cliente decida cuánto quiere pagar (p.ej. en el caso de donaciones), el monto de la transacción deberá ser cero, 0. Aquí un ejemplo:

Inv0334**0**COPkgfq2nN0o52XqnuXZWIN2F

Una vez tengas esta cadena debes encriptarla con SHA256:

!error

**Es sumamente recomendable que generes el hash de integridad en tu servidor en lugar de hacerlo en el frontend de tu sitio web**. De esta forma mantienes oculta la llave secreta ante posibles atacantes aportando una capa adicional de protección a tus ventas.

Si optas por generar este hash en el frontend, corres el riesgo de comprometer la seguridad, ya que un atacante con los conocimientos suficientes podría manipular los datos de tus transacciones (p.ej. cambiar el monto de una venta).

En definitiva, este hash solo cumple con la función para la que fue diseñado si lo generas del lado del servidor.

!success

Podrías por ejemplo crear un servicio que reciba los datos necesarios (identificador único de la venta, monto y divisa) y retorne el hash.

A continuación te ofrecemos el código necesario para poder generar el hash de integración desde tu servidor. Elige el lenguaje que corresponda con el que manejas en tu backend:

```
require 'digest'
 
$cadena_concatenada = "{Identificador}{Monto}{Divisa}{LlaveSecreta}"
 
hash = Digest::SHA256.hexdigest($cadena_concatenada)
 
puts hash
```


!info

El valor obtenido se le debe comunicar al frontend para que pueda ser incluido entre los atributos de configuración del botón de pagos.

### 5\. Prepara una URL para redirigir tras el pago[](#5-prepara-una-url-para-redirigir-tras-el-pago)

Cuando finalice el pago, tu cliente verá un comprobante en la Pasarela de Pagos Web de Bold con el estado de la transacción. En este punto el cliente tiene la opción para regresar a tu tienda si así lo desea.

!info

Ten en cuenta que tu cliente podría decidir no regresar a tu tienda sino simplemente salir del flujo cerrando la pestaña.

!Payment link

Es opcional que tengas una URL dentro de tu tienda a la cual quieres que se redireccione a tus clientes. Nuestra recomendación es que prepares una ruta **en tu sitio web** donde entre otros ejemplos podrías:

*   Agradecer por la compra
*   Indicar cuáles son los siguientes pasos tras la venta
*   Dar información sobre el envío
*   Enlazar al cliente a una sección donde pueda ver sus pedidos

!info

**Esta URL es obligatoria**  
En caso de que no dispongas de una URL específica para este propósito o no la consideres necesaria, simplemente indícanos la URL principal de tu tienda y el usuario volverá directamente a tu página de inicio tras el pago si presiona en “Volver a la tienda”.

Si el cliente decide regresar a tu tienda se usará la URL proporcionada y Bold agregará el **identificador único de la venta** como un parámetro de la misma además del estado de la transacción que vio el cliente en el comprobante. Por ejemplo, si esta es la URL:

```
https://micomercio.com/pagos/respuesta
```


Bold redirigirá al cliente a una URL como la siguiente:

```
https://micomercio.com/pagos/respuesta?bold-order-id=inv0334&bold-tx-status=approved
```


Usando el identificador único de la venta (bold-order-id) podrás consultar el resultado de la transacción en este punto o cuando lo desees mediante una solicitud a la API de Bold como se explica más abajo en el paso 7.

Como respuesta, obtendrás, entre otros, el estado actual de la transacción en la llave payment\_status. Puedes usar la respuesta que recibas o bien el parámetro indicando el estado de la transacción para personalizar la experiencia del usuario, modificar la UI, etc.

!warning

Ten en cuenta que el estado de la transacción recibido al consultar la API en este punto **puede no ser el definitivo**.

Si no defines una url para redirigir al usuario, se utilizará la url original de la tienda.

### 6\. Prepara los datos de la venta[](#6-prepara-los-datos-de-la-venta)

Para cada venta debes proporcionar una serie de datos, algunos de los cuales son obligatorios y otros opcionales.

##### Obligatorios

Para toda venta Bold requiere de los siguientes datos:

*   **api-key** → Llave de identidad del comercio.

##### Opcionales

Los siguientes datos son opcionales. Incluirlos puede ayudar a mejorar la experiencia del cliente y de la propia integración:

*   **amount** → Monto a cobrar sin decimales(impuestos incluidos si aplica). Por ejemplo, si deseas cobrar $95.000 COP, deberás ingresar: 95000 (debes tener en cuenta las restricciones de montos para tu comercio). El mínimo son $1000 COP.
    
    !info
    
    **Nota:**
    
    *   Si en vez de un monto fijo quieres que tu cliente decida cuánto quiere pagar (ej. en el caso de donaciones), el monto de la transacción deberá ser cero, 0 o no definir el atributo _amount_. En este caso, la venta no puede incluir impuestos.
    *   Si defines atributo _amount_, los atributos _currency_, _order-id_ e _integrity-signature_ se vuelven obligatorios para validar la transacción y por seguridad.
    
*   **currency** → Divisa en la que se realizará la venta. Puedes usar **COP** (pesos colombianos) o **USD** (dólar estadounidense). Sin embargo, ten presente que la venta será procesada en pesos colombianos según la TRM del momento o en la moneda seleccionada por el pagador si su tarjeta aplica para conversión y cobro por DCC (Conversión Dinámica de Divisas).
    
*   **order-id** → Identificador o referencia única de la venta. Solo se aceptan caracteres alfanuméricos, guiones bajos (\_) y medios (-) y un máximo de 60 caracteres **(te recomendamos adicionar la fecha en formato timestamp para evitar identificadores duplicados)**. Se asignará uno automáticamente, cuando no está definido y no es obligatorio.
    
*   **integrity-signature** → Hash criptográfico para garantizar la integridad de los datos de la venta.
    
*   **redirection-url** → URL a la que redirigir al cliente tras finalizar una transacción. Debe ser una URL válida, debe iniciar con el protocolo https:// y a ser posible del dominio de tu negocio online. Es opcional, si no se define se tomará la URL principal del dominio para redirigir al pagador al finalizar la compra. Para pruebas locales no usar 127.0.0.1, en vez debe usar localhost.
    
*   **description** → Descripción de la venta. Si se incluye, deberá tener un mínimo de 2 y un máximo de 100 caracteres. El uso de emojis está permitido. No puede contener ninguna URL.
    
*   **tax** → Es la información del impuesto que quieres aplicar a la venta. Se debe indicar el tipo y, en el caso del IVA, el porcentaje que puede ser del 5% o del 19%, si no aplica ningún impuesto debe omitir el atributo. Los tipos de impuestos permitidos son los siguientes:
    
    *   **vat-5**: para IVA del 5%
    *   **vat-19**: para IVA del 19%
    *   **iac-8**: para el Impuesto al Consumo (8%)
    *   Simple: puedes ingresar un valor numérico como por ejemplo 1900 o con dos decimales 1938.45 y será aplicado como VAT.
    *   Múltiple: puedes enviar un JSON con el nombre del impuesto y el valor a cobrar, por ejemplo: `data-tax='{"vat":1950, "iac":1000}'` si en tu compra aplican ambos impuestos.

!warning

El impuesto **IVA/VAT** no debe superar el 19% del monto total de la venta.

Para el Impuesto al Consumo **IAC**, no debe superar el 25% del monto total de la venta.

!info

Los impuestos no se sumarán al monto de la transacción indicado en amount.

Es decir, si en **amount** indicaste que el valor total de la venta es de COP $100,000 y quieres aplicarle un IVA del 19%, el valor del impuesto, ya debe estar incluido en el monto indicado. Aquí tienes un ejemplo:

COP $100,000 → valor total de la venta

COP $84,033 → base gravable

COP $15,966 → IVA 19%

Bold se encarga de calcular el impuesto deseado sobre el valor total de la venta, no es necesario que lo proporciones (aplican impuestos vigentes para Colombia).

*   **customer-data** → información del comprador, serán precargados en el formulario de pago que recibe un objeto convertido a string, los datos opcionales que recibe son:
    
    *   email: correo del comprador.
    *   fullName: nombre completo del comprador.
    *   phone: celular del comprador.
    *   dialCode: código de llamada del país del celular del comprador.
    *   documentNumber: número de identificación del comprador.
    *   documentType: tipo de identificación del comprador, los tipos de identificación aceptados son **CC**: Cédula de ciudadanía, **CE**: Cédula extranjera, **PA**: Pasaporte, **NIT**: Número de identificación tributaria, **TI**: Tarjeta de identidad.
*   **billing-address** → información de ubicación del comprador, serán precargados en el formulario de pago que recibe un objeto convertido a string, los datos opcionales que recibe son:
    
    *   address: dirección del comprador.
    *   city: ciudad del comprador.
    *   zipCode: código postal de la dirección del comprador.
    *   state: estado/departamento del comprador.
    *   country: código de dos dígitos del país del comprador.
*   **expiration-date** → (fecha de expiración): La fecha y hora en la que el pago expirará, representada en nanosegundos desde la época Unix.
    
*   **origin-url** → (URL retorno por abandono): Configura una URL de retorno para redirigir al usuario si abandona o cancela una transacción. Si no lo haces, usaremos la URL padre donde se genera el botón. Debe ser una URL válida, debe iniciar con el protocolo https:// y a ser posible del dominio de tu negocio online. Puedes usarla para definir una página de reintento de pago u ofrecer un descuento si continua con el pago.
    
*   **extra-data-1** y **extra-data-2** → Campos para información extra que el comercio desee enviar. No afecta el proceso de compra y no son visibles para el comprador. La longitud mínima es de 2 caracteres y la máxima de 60.
    

### 7\. Embedded Checkout[](#7-embedded-checkout)

Ahora puedes integrar nuestra pasarela de pagos sin necesidad de que tus clientes salgan de tu sitio web y manteniendo la seguridad en todas tus ventas.

Embedded Checkout utiliza un elemento HTML de tipo `<iframe>` para abrir nuestra pasarela de pagos en un modal optimizado para dispositivos de todos los tamaños sin tener que salir de tu sitio web.

Por lo demás nada cambia, ya que el usuario procesará su pago dentro del mismo y, al finalizar, será dirigido al resumen de la compra dentro de tu sitio web o a la URL que hayas configurado usando la opción `redirection-url`.

Para usar esta característica al momento de configurar tu integración solo debes usar la opción `render-mode` con el valor `embedded` como en el siguiente ejemplo:

```
  <script
    data-bold-button
    data-api-key="LLAVE_DE_IDENTIDAD"
    data-description="Pago a traves de Embedded Checkout"
    data-redirection-url="https://micomercio.com/pagos/resultado"
    data-render-mode="embedded"
  ></script>
```


!Ejemplo Embedded Checkout

### 8\. Obtén el estado de una transacción[](#8-obtén-el-estado-de-una-transacción)

Finalmente solo queda obtener el estado de la transacción después de que el cliente inicie el proceso de pago. Con esto podrás actualizar tu base de datos para llevar un seguimiento de las ventas realizadas y/o pedidos completados.

Sigue este artículo para conocer las diferentes formas de obtener el estado de una transacción.

A tener en cuenta[](#a-tener-en-cuenta)
---------------------------------------

1.  **Divisas soportadas**
    
    Ahora expandimos tus oportunidades de venta. Además de gestionar precios y compras en **pesos colombianos (COP)**, ahora puedes configurar tu botón en **dólares estadounidenses (USD)**, esto significa que tus clientes podrán visualizar los precios en esta divisa y realizar pagos.
    
    Recuerda que las ventas serán procesadas en pesos colombianos (COP) según la TRM del momento, asegurando que siempre tengas el control de tus ingresos locales. Por ejemplo, si un cliente paga $25 USD y la TRM en ese momento es de $4,000, recibirás $100,000 COP.
    
    Ten presente que la conversión final a la divisa local del pagador será realizada por la entidad financiera emisora de la tarjeta.
    
2.  **Integración con e-commerce** Ahora ofrecemos integración nativa mediante plugins para las principales plataformas de e-commerce, incluyendo WordPress (WooCommerce), PrestaShop, Jumpseller, Sumer y Tiendanube. Puedes encontrar la documentación de cada uno de los plugins aquí.
    
    Si tu tienda online está basada en una plataforma distinta como Wix o Shopify, estamos trabajando para habilitar más integraciones y facilitarte el proceso en el futuro.
    
3.  **Manejo de órdenes de compra**
    
    La responsabilidad de manejar las órdenes de compra recae sobre tu sitio web. Esto significa que:
    
    Debes asegurarte de crear la orden de compra antes de pasar al proceso de pago. Debes actualizar el estado de las transacciones en tu sistema.
    
4.  **Expiración de pagos**
    
    Tus clientes disponen de 24h para realizar el pago después de ser redirigidos a la Pasarela de Pagos Web de Bold.
    
5.  **Restricciones de montos**
    
    Por políticas internas de Bold cada comercio tiene unas restricciones de montos para los diferentes medios de pago.
    
    Puedes consultar los límites para tu comercio iniciando sesión en https://bold.co  y accediendo a https://panel.bold.co/panel/online-payments/payment-links/maximum-amounts  donde verás tus restricciones de esta manera:
    

!Button types

Debes tener en cuenta estas restricciones a la hora de integrarte con las soluciones de Bold y solicitar un aumento de las mismas a través del correo de soporte si así lo requieres.

Si tratas de crear una transacción que sobrepasa los límites de tu comercio obtendrás un error.

6.  **Usa HTTPS**
    
    Si todavía no lo haces, considera implementar HTTPS para mejorar tu sitio web.
    
    Es esencial que tu sitio web use HTTPS para brindar una experiencia más segura a los usuarios y evitar que sea considerado como “No seguro” por los navegadores.
    
    Google Chrome p.ej. tiene esto muy en cuenta y, dado que Chrome es el navegador más usado con más del 60% del tráfico web, adoptar HTTPS contribuirá significativamente a la confianza de tus visitantes.