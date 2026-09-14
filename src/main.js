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

const overlay = document.getElementById("overlay");

const modalTitle = document.getElementById("modalTitle");

const editId = document.getElementById("editId");

const nameInput = document.getElementById("name");

const emailInput = document.getElementById("email");

const departmentInput =
    document.getElementById("department");

const yearInput =
    document.getElementById("year");

const statusInput =
    document.getElementById("status");

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

                        <td class="row-actions">

                            <button
                                data-action="edit"
                                data-id="${student.id}"
                            >
                                Edit
                            </button>

                            <button
                                data-action="delete"
                                data-id="${student.id}"
                            >
                                Delete
                            </button>

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
// OPEN MODAL
// ========================================

function openModal(student = null) {

    overlay.style.display = "flex";


    if (student) {

        modalTitle.textContent =
            "Edit Student";


        editId.value =
            student.id;


        nameInput.value =
            student.name;


        emailInput.value =
            student.email;


        departmentInput.value =
            student.department;


        yearInput.value =
            student.year;


        statusInput.value =
            student.status;

    }

    else {

        modalTitle.textContent =
            "Add Student";


        editId.value =
            "";


        nameInput.value =
            "";


        emailInput.value =
            "";


        departmentInput.value =
            "CSE";


        yearInput.value =
            "1";


        statusInput.value =
            "Active";
    }
}


// ========================================
// CLOSE MODAL
// ========================================

function closeModal() {

    overlay.style.display =
        "none";
}


// ========================================
// ADD OR UPDATE STUDENT
// ========================================

async function saveStudent() {

    const id =
        editId.value;


    const studentData = {

        name:
            nameInput.value.trim(),

        email:
            emailInput.value.trim(),

        department:
            departmentInput.value,

        year:
            Number(yearInput.value),

        status:
            statusInput.value

    };


    // Validation

    if (
        !studentData.name ||
        !studentData.email
    ) {

        alert(
            "Please enter name and email."
        );

        return;
    }


    // ====================================
    // UPDATE
    // ====================================

    if (id) {

        const { error } =
            await supabase

                .from("students")

                .update(studentData)

                .eq(
                    "id",
                    Number(id)
                );


        if (error) {

            console.error(error);

            alert(
                "Update failed:\n\n" +
                error.message
            );

            return;
        }

    }


    // ====================================
    // INSERT
    // ====================================

    else {

        const { error } =
            await supabase

                .from("students")

                .insert([
                    studentData
                ]);


        if (error) {

            console.error(error);

            alert(
                "Insert failed:\n\n" +
                error.message
            );

            return;
        }
    }


    closeModal();


    await loadStudents();
}


// ========================================
// DELETE STUDENT
// ========================================

async function deleteStudent(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this student?"
        );


    if (!confirmed) {
        return;
    }


    const { error } =
        await supabase

            .from("students")

            .delete()

            .eq(
                "id",
                Number(id)
            );


    if (error) {

        console.error(error);

        alert(
            "Delete failed:\n\n" +
            error.message
        );

        return;
    }


    await loadStudents();
}


// ========================================
// BUTTON EVENTS
// ========================================

document
    .getElementById("addStudentBtn")
    .addEventListener(
        "click",
        () => openModal()
    );


document
    .getElementById("addStudentMainBtn")
    .addEventListener(
        "click",
        () => openModal()
    );


document
    .getElementById("cancelBtn")
    .addEventListener(
        "click",
        closeModal
    );


document
    .getElementById("saveBtn")
    .addEventListener(
        "click",
        saveStudent
    );


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
// TABLE ACTIONS
// ========================================

tbody.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {
            return;
        }


        const id =
            Number(
                button.dataset.id
            );


        const action =
            button.dataset.action;


        const student =
            students.find(
                item =>
                    item.id === id
            );


        if (action === "edit") {

            openModal(student);

        }


        if (action === "delete") {

            deleteStudent(id);

        }

    }
);


// ========================================
// START APPLICATION
// ========================================

loadStudents();