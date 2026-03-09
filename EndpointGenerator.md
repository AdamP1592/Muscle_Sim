# Constraints:
    - For sanities sake this is not going to be a general purpose html parser
    - There will be no multi-line elements. There will be no <script \n src = "app.js" \n ...>
    - There cannot be nested quotes in any attributes.
    - Assets cannot have duplicate names(it's bad practice anyways).

# What it does:
    Takes in two params from the commandline, one is a folder that holds html files, the other is an output folder. The EndpointGenerator scans the input folder for html files, and replaces all asset filepaths in the folder with absolute endpoints, and then generates a json lookup table where: endpoint->filepath. 


    - Takes in two args:
        - template folder: the path to the directory that holds all the html files
        - output folder: the path you want to output the modified templates and endpoint json
    