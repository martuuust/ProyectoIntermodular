<?php
// Datos de conexión
$servername = "localhost:3306";
$username = "root";   // por defecto en XAMPP
$password = "";       // por defecto en XAMPP
$dbname = "campamento"; // nombre de la bbdd

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Obtener datos del formulario
$nombre1 = $_POST['nombre'];
$apellidos1 = $_POST['apellidos'];
$dni1 = $_POST['dni'];
$tel1 = $_POST['tel']; // puedes usar $_POST['numero'] si quieres ese campo
$email1 = $_POST['email'];

// Preparar la sentencia
$stmt = $conn->prepare("INSERT INTO familia (nombre, apellidos, dni_fam, telefono, correo) VALUES (?, ?, ?, ?, ?)");
if ($stmt === false) {
    die("Error al preparar la sentencia: " . $conn->error);
}

// Vincular parámetros
$stmt->bind_param("sssss", $nombre1, $apellidos1, $dni1, $tel1, $email1);

// Ejecutar la sentencia
if ($stmt->execute()) {
    echo "Registro guardado correctamente";
} else {
    echo "Error: " . $stmt->error;
}

// Cerrar conexiones
$stmt->close();
$conn->close();
?>
