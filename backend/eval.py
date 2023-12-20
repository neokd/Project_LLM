import evaluate
rouge_score = evaluate.load("rouge")



# Define the candidate predictions and reference sentences
predictions = ["A Harvard team has made a key milestone in the quest for stable and scalable quantum computing. They created a programmable, logical quantum processor capable of encoding up to 48 logical qubits and executing hundreds of logical gate operations. Their system is the first demonstration of large-scale algorithm execution on an error-corrected quantum computer, heralding the advent of early fault-tolerant, or reliably uninterrupted, quantum computation. The work was published in Nature and performed in collaboration with colleagues from MIT and Boston-based QuEra Computing. Harvard's Office of Technology Development recently entered into a licensing agreement with QuEra for a patent portfolio based on innovations developed in Lukin's group. This breakthrough is a tour de force of quantum engineering and design, enabling transformative benefits for science and society as a whole."]

references = ["A Harvard team has successfully created a programmable, logical quantum processor capable of encoding up to 48 logical qubits and executing hundreds of logical gate operations, marking a key milestone in the quest for stable and scalable quantum computing. Their system is the first demonstration of large-scale algorithm execution on an error-corrected quantum computer, heralding the advent of early fault-tolerant or reliably uninterrupted quantum computation. The breakthrough builds on years of work on a neutral atom array, pioneered in Lukin's lab and now being commercialized by QuEra. With their logical quantum processor, the researchers demonstrate parallel, multiplexed control of an entire patch of logical qubits using lasers. The work was supported by multiple funding agencies and companies."]

# Compute the ROUGE score
results = rouge_score.compute(predictions=predictions, references=references)

# Print the results
print(results)
