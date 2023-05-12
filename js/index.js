

const toggle_menu = () => {

}



const sections = Array.from(document.getElementsByClassName("options-section"))

sections.forEach(section => {
    const label = section.getElementsByClassName("checkbox-label")[0]
    const contents = section.querySelector("div")

    label.addEventListener("click", () => {
        contents.style.display = contents.style.display !== "block" ? "block" : "none";
    })
})