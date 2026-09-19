import "./style.css";
import { supabase } from "./supabase.js";


// ========================================
// GLOBAL DATA
// ========================================

let students = [];


// ========================================
// DOM ELEMENTS
// ========================================

const tbody = document.getElementById("tbody");

const search = document.getElementById("search");

const totalElement =
    document.getElementById("total");

const activeElement =
    document.getElementById("active");

const departmentsElement =
    document.getElementById("departments");

const emptyElement =
    document.getElementById("empty");

const connectionStatus =
    document.getElementById("connectionStatus");


// ========================================
// LOAD STUDENTS FROM SUPABASE
// ========================================

async function loadStudents() {

    connectionStatus.innerHTML =
        `<span class="dot"></span>Connecting...`;

    const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(
            "Supabase error:",
            error
        );

        connectionStatus.innerHTML =
            `🔴 Database Error`;

        alert(
            "Could not load students:\n\n" +
            error.message
        );

        return;
    }


    students = data || [];


    connectionStatus.innerHTML =
        `<span class="dot"></span>Supabase Connected`;


    render();
}


// ========================================
// RENDER STUDENTS
// ========================================

function render() {

    const query =
        search.value
            .toLowerCase()
            .trim();


    const filteredStudents =
        students.filter(student => {

            return (

                student.name
                    .toLowerCase()
                    .includes(query)

                ||

                student.email
                    .toLowerCase()
                    .includes(query)

                ||

                student.department
                    .toLowerCase()
                    .includes(query)

            );

        });


    tbody.innerHTML =
        filteredStudents
            .map(student => {

                return `

                    <tr>

                        <td>
                            #${String(student.id).padStart(3, "0")}
                        </td>

                        <td>
                            <b>${student.name}</b>
                        </td>

                        <td>
                            ${student.email}
                        </td>

                        <td>
                            ${student.department}
                        </td>

                        <td>
                            Year ${student.year}
                        </td>

                        <td>

                            <span
                                class="tag ${
                                    student.status === "Inactive"
                                        ? "off"
                                        : ""
                                }"
                            >
                                ${student.status}
                            </span>

                        </td>

                    </tr>

                `;

            })
            .join("");


    emptyElement.style.display =
        filteredStudents.length === 0
            ? "block"
            : "none";


    // Statistics

    totalElement.textContent =
        students.length;


    activeElement.textContent =
        students.filter(
            student =>
                student.status === "Active"
        ).length;


    departmentsElement.textContent =
        new Set(
            students.map(
                student =>
                    student.department
            )
        ).size;
}


// ========================================
// BUTTON EVENTS
// ========================================

document
    .getElementById("studentsBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("studentsPanel")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );


document
    .getElementById("dashboardBtn")
    .addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


document
    .getElementById("databaseBtn")
    .addEventListener(
        "click",
        () => {

            alert(
                "Database: Supabase PostgreSQL"
            );

        }
    );


document
    .getElementById("settingsBtn")
    .addEventListener(
        "click",
        () => {

            alert(
                "Settings coming later."
            );

        }
    );


// ========================================
// SEARCH
// ========================================

search.addEventListener(
    "input",
    render
);


// ========================================
// START APPLICATION
// ========================================

loadStudents();