const debug = false

// What should get set in the input once a value is selected
const valueForInput = (result) => {
  if (!result) return ''
  else return result.name
}

// What gets displayed for each option
const menuResultItem = (result) => {
  if (result) {
    let name = (debug) ? `${result.name} (${result.weight})` : result.name
    let output = result.append ? `<span>${name}</span> ${result.append}` : `<span>${name}</span>`
    return result.hint ? `${output}<span class="autocomplete__option--hint">${result.hint}</span>` : output
  }
}

const onConfirm = (selected) => {
  // console.log(`Selected:`, selected)
};

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

const setupAutocomplete = (component) => {

  // Locate the elements
  const selectElement = component.querySelector('select')
  const inputElement = component.querySelector('input')

  // We might be enhancing a select or an input
  const elementType = (selectElement) ? 'select' : 'input'
  const element = selectElement || inputElement || false

  // Get config for autocomplete
  const autoselect          = element.getAttribute('data-autoselect') || false
  const classes             = element.getAttribute('data-classes') || false
  const describedById       = element.getAttribute('aria-describedby') || false
  const minLength           = element.getAttribute('data-min-length') || 2
  const placeholder         = element.getAttribute('data-placeholder') || false
  const showAllValues       = element.getAttribute('data-showAllValues') || false
  const showNoOptionsFound  = element.getAttribute('data-show-no-options-found') || true
  const showSuggestions     = element.getAttribute('data-showSuggestions') || false
  const value               = element.getAttribute('data-value') || null
  let values                = JSON.parse(element.getAttribute('data-autocomplete-values') || "[]")

  // If the enhanced element has aria-describedBy, grab the description to pass
  // to the autocomplete
  let describedBy = null
  if (describedById){
    describedBy = document.getElementById(describedById).innerText
    // Add a full stop if the hint didn't have one.
    describedBy = (describedBy.endsWith(".")) ? describedBy : `${describedBy}.`
  }

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

  const describedByHint = () => {
    return `${describedBy} When autocomplete results are available use up and down arrows to review and enter to select. Touch device users, explore by touch or with swipe gestures.`
  }

  const filter = (query, populateResults) => {
    let results = autocompleteSort(query, values)

    // If in suggestions mode we don’t want to show a 'suggestions' banner when there are no results
    if (showSuggestions){
      if (results.length == 0) component.classList.add('app-autocomplete--with-suggestions-no-results')
      else {
        component.classList.remove('app-autocomplete--with-suggestions-no-results')
      }
    }
    
    populateResults(results)
  }

  // Alternate strings to use when in suggestions mode
  const suggestionNoResults = () => 'No suggestions found. Enter your own answer'
  const suggestionStatusNoResults = () => "No suggestions found"

  let autocompleteOptions = {
    id: element.id,
    name: element.name,
    defaultValue: element.value,
    templates: {
      inputValue: valueForInput,
      suggestion: menuResultItem
    },
    onConfirm,
    autoselect,
    minLength,
    placeholder,
    showAllValues,
    showNoOptionsFound,
    source: filter,
    ...(describedBy ? { tAssistiveHint: describedByHint } : {}),
    ...(showSuggestions ? { tNoResults: suggestionNoResults } : {}), // conditional
    ...(showSuggestions ? { tStatusNoResults: suggestionStatusNoResults } : {}), // conditional
    ...(value ? {defaultValue: value} : {}) // conditional
  }

  if (selectElement){
    accessibleAutocomplete.enhanceSelectElement({
      selectElement: element,
      ...autocompleteOptions
    })
  }
  else if (inputElement){

    const autocompleteContainer = document.getElementById(`${element.id}-autocomplete-container`)

    // Because of the govuk macros, the container for the autocomplete is initially
    // placed _after_ the input. We now move the container within the input container.
    const inputFormGroup = autocompleteContainer.previousElementSibling
    if (inputFormGroup.contains(input)) {
      inputFormGroup.appendChild(autocompleteContainer)
    }

    accessibleAutocomplete({
      element: autocompleteContainer,
      ...autocompleteOptions
    })
  }

  // Remove the original input
  element.remove()

}

const initAutocompletes = () => {
  const allAutocompleteElements = document.querySelectorAll('[data-module="app-autocomplete"]')
  allAutocompleteElements.forEach(element => setupAutocomplete(element))
}
