// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;

use csv::{self, Reader};
use magic_crypt::{new_magic_crypt, MagicCryptTrait};
use rusqlite::{self, named_params, Connection, OpenFlags};
use serde::{Deserialize, Serialize};
use tauri::{self, Manager};


#[derive(Debug, Serialize)]
struct PassData {
    id: i32,
    username: String,
    url: String,
    password: String,
    favorite: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct FilePath {
    path: String
}

// Data transfer object for adding new password.
#[derive(Debug, Serialize, Deserialize)]
struct PassDTO {
    username: String,
    password: String,
    url: String,
    favorite: i32,
}

// struct meant for reading contents of user's CSV file.
#[derive(Debug, Deserialize)]
struct PassCSV {
    url: String,
    username: String,
    password: String,
}

#[tauri::command]
fn fetchdata(handle: tauri::AppHandle) -> Result<Vec<PassData>, String> {
    let resolver = handle.path().resolve("data/userdata.db3", tauri::path::BaseDirectory::Resource).expect("could not find file.");
    File::open(&resolver).expect("Could not open / create folder: ");
    let conn = Connection::open(&resolver).expect("Could not establish a connection.");

    conn.execute("CREATE TABLE IF NOT EXISTS userdata (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, user_name TEXT NOT NULL, password TEXT NOT NULL, favorite INTEGER DEFAULT 0, url TEXT NOT NULL)", ()).expect("Could not create database.");

    let mut data: Vec<PassData> = Vec::new();

    let mut req = conn.prepare("SELECT * FROM userdata").unwrap();
    let rows = req
        .query_map([], |row| {
            Ok(PassData {
                id: row.get(0)?,
                username: row.get(1)?,
                password: row.get(2)?,
                favorite: row.get(3)?,
                url: row.get(4)?,
            })
        }).expect("Could not get data.");
    
    for d in rows {
        data.push(d.expect("Could not get content from row."));
    }

    Ok(data)

}

#[tauri::command]
fn favorite_pw(id: i32, fave: i32, handle: tauri::AppHandle) -> Result<String, String> {

    let resolver = handle.path().resolve("data/userdata.db3", tauri::path::BaseDirectory::Resource).expect("could not find file.");
    let conn = Connection::open_with_flags(resolver, OpenFlags::SQLITE_OPEN_READ_WRITE).expect("Could not establish a connection.");

    let query = conn.execute(
        "UPDATE userdata SET favorite = :fave WHERE id = :id",
        named_params! {":fave": fave, ":id": id},
    );
    
    match query {
        Ok(_x) => Ok(format!("Changed favorite successfully!")),
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
fn add_pw(data: PassDTO, handle: tauri::AppHandle) -> Result<String, String> {
    let resolver = handle.path().resolve("data/userdata.db3", tauri::path::BaseDirectory::Resource).expect("could not find file.");
    let conn = Connection::open_with_flags(resolver, OpenFlags::SQLITE_OPEN_READ_WRITE).expect("Could not establish a connection.");

    let query = conn.execute(
        "INSERT INTO userdata (user_name, password, favorite, url) VALUES (?1, ?2, ?3, ?4)",
        (&data.username, &encrypt_pw(data.password).expect("Could not encrypt password."), &data.favorite, &data.url),
    );
    
    match query {
        Ok(x) => Ok(format!("Sucessfully added password! {:?}", x)),
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
fn delete_pw(id: i32, handle: tauri::AppHandle) -> Result<String, String> {
    let resolver = handle.path().resolve("data/userdata.db3", tauri::path::BaseDirectory::Resource).expect("could not find file.");
    let conn = Connection::open_with_flags(resolver, OpenFlags::SQLITE_OPEN_READ_WRITE).expect("Could not establish a connection.");

    let query = conn.execute(
        "DELETE FROM userdata WHERE id = :id",
        named_params! {":id": id},
    );

    match query {
        Ok(_ok) => Ok(format!("Deleted password successfully!")),
        Err(rusqlite::Error::InvalidParameterName(_)) => Err(format!("Could not find the password.")),
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
fn import_pass(file_path: String, handle: tauri::AppHandle) -> Result<String, String> {
    let mut binding = Reader::from_path(file_path).expect("Could not read this file.");
    let reader = binding.deserialize::<PassCSV>();

    for res in reader {
        let pw = res.unwrap();
        let pw_from_csv = PassDTO {
            username: pw.username,
            password: encrypt_pw(pw.password).expect("Could not encrypt password."),
            url: pw.url,
            favorite: 0 //boolean
        };
        add_pw(pw_from_csv, handle.clone()).expect("Could not add any new passwords.");
    }

    Ok(format!("Successfully imported passwords from CSV file!"))
}

#[tauri::command]
fn export_pass(file_path: String, handle: tauri::AppHandle) {
    let path = file_path;
    File::create(path.clone()).expect("Something went wrong.");
    let passwords = fetchdata(handle).expect("Could not fetch data.");

    let mut writer = csv::Writer::from_path(path).expect("Couldn't find the file.");

    writer
        .write_record(&["url", "name", "username", "password"])
        .expect("Could not write.");

    for data in passwords {
        writer
            .write_record(&[data.url.clone(), data.url, data.username, data.password])
            .expect("Had a problem writing.");
    }
    writer.flush().expect("Something went wrong.");
}

#[tauri::command]
fn encrypt_pw(pw: String) -> Result<String, String> {
    let mc = new_magic_crypt!("rustcrab", 256);

    let base64 = mc.encrypt_bytes_to_base64(&pw);

    Ok(base64)
}

#[tauri::command]
fn decrypt_str(encrypted: String) -> Result<String, String> {
    let mc = new_magic_crypt!("rustcrab", 256);
    let result = mc.decrypt_base64_to_string(&encrypted);

    match result {
        Ok(x) => Ok(x),
        Err(err) => Err(err.to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            fetchdata,
            favorite_pw,
            add_pw,
            delete_pw,
            import_pass,
            export_pass,
            encrypt_pw,
            decrypt_str
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
