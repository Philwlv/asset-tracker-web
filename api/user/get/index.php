<?php
/* Get user based on admin_id
* "api/assets/get?id={admin_id}"
* Requires paramater id specifying which asset id to retrieve
*/
include_once("../../api_config.php");

// Include cross origin headers
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

/// Check we have required data to do the request
if (!isset($_GET["admin_id"])) {
    die("Unable to get asset id - Id parameter is missing");
}

$usid = htmlspecialchars($_GET["admin_id"]);
if (!$usid) {
    die("Unable to parse user id - No id specified");
}

/// Open a connection to the database
$conn = mysqli_connect($SERVER_LOCATION, $SERVER_USERNAME, $SERVER_PASSWORD, $DB_NAME);
if (!$conn) {
    die("Unable to open connection - " . mysqli_connect_error());
}

/// Query to determine the next available asset id in table
$sql = "SELECT * FROM user WHERE admin_id=" . $usid;
$result = $conn->query($sql);

class User { }

if ($result->num_rows > 0) 
{
    // Map individual asset onto single object and cast to correct data types
    while($row = $result->fetch_assoc()) {
        $user = new User();
        $user->admin_id = intval($row["admin_id"]);
        $user->admin_name = $row["admin_name"];
        $user->admin_email = $row["admin_email"];
        $user->admin_password = $row["admin_password"];
    }

    // Return the array of assets
    echo json_encode([
        "user" => $user
    ], JSON_PRETTY_PRINT);
} 
else 
{
    // Unable to get any data from table or table is empty, return null array
    $arr = array(
        "user" => null
    );
    echo json_encode($arr, JSON_PRETTY_PRINT);
}

?>