// What should get set in the input once a value is selected
const inputValue = (result) => {
  return result && result.name
}

// What gets displayed for each option
const suggestion = (result) => {
  if (result) {
    let output = result.append ? `<span>${result.name}</span> ${result.append}` : `<span>${result.name}</span>`
    return result.hint ? `${output}<span class="autocomplete__option--hint">${result.hint}</span>` : output
  }
}

// Extract data attributes from select options
const enhanceSelectOption = (option) => {
  return {
    name: option.label,
    value: option.value,
    ...(option.getAttribute('data-synonyms') ? { synonyms: option.getAttribute('data-synonyms').split('|') } : {}),
    ...(option.getAttribute('data-append') ? { append: option.getAttribute('data-append') } : {}),
    ...(option.getAttribute('data-hint') ? { hint: option.getAttribute('data-hint') } : {}),
    boost: (parseFloat(option.getAttribute('data-boost')) || 1)
  }
}

// Enhance a select
const accessibleAutocompleteFromSelect = (input, autocompleteOptions = {}) => {

  // Save the id as we will delete this input later but need the id still
  const inputId = input.id
  const describedBy = input.getAttribute('aria-describedby') || false

  accessibleAutocomplete.enhanceSelectElement({
    selectElement: input,
    id: input.id,
    name: input.name,
    defaultValue: input.value,
    templates: {
      inputValue,
      suggestion
    },
    ...autocompleteOptions
  })

  // Remove the select
  input.remove()

  // Copy over aria-describedBy so the hints are associated correctly
  const newAutocomplete = document.getElementById(inputId)

  if (describedBy){
    newAutocomplete.setAttribute('aria-describedby', describedBy)
  }

}

// Enhance a text input
const accessibleAutocompleteFromInput = (input, autocompleteOptions = {}) =>{

  // Save the id as we will delete this input later but need the id still
  const inputId = input.id
  const describedBy = input.getAttribute('aria-describedby') || false
  const autocompleteContainer = document.getElementById(`${input.id}-autocomplete-container`)

  // Move autocomplete to the form group containing the input to be replaced
  const inputFormGroup = autocompleteContainer.previousElementSibling
  if (inputFormGroup.contains(input)) {
    inputFormGroup.appendChild(autocompleteContainer)
  }

  accessibleAutocomplete({
    element: autocompleteContainer,
    id: input.id,
    name: input.name,
    defaultValue: input.value,
    templates: {
      inputValue,
      suggestion
    },
    ...autocompleteOptions
  })

  // Delete the source input
  input.remove()

  // Copy over aria-describedBy so the hints are associated correctly
  const newAutocomplete = document.getElementById(inputId)
  if (describedBy){
    newAutocomplete.setAttribute('aria-describedby', describedBy)
  }
}


const setupAutocomplete = (component) => {

  // Locate the elements
  const selectElement = component.querySelector('select')
  const inputElement = component.querySelector('input')

  // We might be enhancing a select or an input
  const elementType = (selectElement) ? 'select' : 'input'
  const element = selectElement || inputElement || false
  // console.log(`Accessible autocomplete: enhancing ${elementType}`)

  // Get config for autocomplete
  const autoselect          = element.getAttribute('data-autoselect') || false
  const minLength           = element.getAttribute('data-min-length') || 2
  const placeholder         = element.getAttribute('data-placeholder') || false
  const showAllValues       = element.getAttribute('data-showAllValues') || false
  const showNoOptionsFound  = element.getAttribute('data-show-no-options-found') || false
  let values                = JSON.parse(element.getAttribute('data-autocomplete-values') || "[]")
  const value               = element.getAttribute('data-value') || null

  // If enhancing a select and values not provided, fall back to options from select
  if (!values.length && elementType == 'select'){
    let selectOptions = Array.from(selectElement?.options)
      // Remove empty or disabled select options
      .filter(option => {
        if (option.disabled || option.label == "") return false
        return true
      })

    // Extract values from data attributes in each option
    values = selectOptions.map(option => enhanceSelectOption(option))
  }

  if (!values || values.length == 0){
    console.log(`Autocomplete error: no values found for ${element?.id}`)
  }

  const filter = (query, populateResults) => {
    let results = autocompleteSort(query, values)
    populateResults(results)
  }

  let autocompleteOptions = {
    autoselect,
    minLength,
    placeholder,
    showAllValues,
    showNoOptionsFound,
    source: filter,
    ...(value ? {defaultValue: value} : {})
  }

  if (selectElement){
    accessibleAutocompleteFromSelect(element, autocompleteOptions)
  }
  else if (inputElement){
    accessibleAutocompleteFromInput(element, autocompleteOptions)
  }

}

const initAutocompletes = () => {
  const allAutocompleteElements = document.querySelectorAll('[data-module="app-autocomplete"]')
  allAutocompleteElements.forEach(element => setupAutocomplete(element))
}
