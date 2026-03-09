import os, re, json, sys

def get_tag(line:str):
    """
    Grabs an html tag from text and splits it into the tag name and all attributes
    Params:
        line (string):
            a line from an html file
    Returns: 
        A tuple containing:
            - A tuple that contains the starting and ending index of the match
            - The tag name
            - All the attributes in the tag.
    """
    tag_capture = r'<\s*(\w+)\s*([^>]*)>'

    tag_info = re.search(tag_capture, line)

    if not tag_info:
        return ((-1, -1), "", "")
    
    groups = tag_info.groups()

    tag_name = groups[0]
    tag_attributes = groups[1]

    return (tag_info.span(), tag_name, tag_attributes)

## this need to be built to also have the ability to do a deep search for endpoints
def generate_endpoints(template_origin:str, template_destination:str):
    """
    Takes in a folder of templates and outputs a folder with: 
        - copies of the tempaltes with their asset paths modified to be absolute url endpoints.
        - A Json lookup table of endpoint:filepath
    Params:
        template_origin (string):
            Folder path for the input files.
        template_destination (string):
            Folder path for the output files.
        deep (bool):
            Whether you need to do a deep check for asset paths or not
    """


    output_map = {}
    # capture the tag and everything between the tag and the closing >
    tag_capture = r'<\s*(\w+)\s*([^>]*)>'
    attribute_capture = r"\s*([^\s=]+)\s*=\s*[\'\"]([^\'\"]+)"
    # ([^\s=]+)\s*=\s*["\']([^"\']*)["\']*
    # get all html files in the dir
    for entry in os.listdir(template_origin):
        if entry.lower().endswith(".html"):
            # paths are the absoltute path of the origin + the entry file
            html_path = os.path.abspath(os.path.join(template_origin, entry))
            output_map[entry] = html_path
    
    if len(output_map) == 0:
        return False;
    
    # read each html file
    # find local asset paths
    # strip those paths and replace them with endpoints
    # store those asset paths and endpoints the same way as with the root files
    # store the copies 
    root_files = [value for value in output_map.values()]
    for html_path in root_files:
        
        output_file = os.path.join(template_destination, os.path.basename(html_path))
        with open(html_path, "r") as infile:
            with open(output_file, "w+") as outfile:
            
                for line in infile:
                    span, tag_name, tag_attributes = get_tag(line)
                    
                    # if tag_attributes isn't empty, go on to capture the attributes
                    if tag_attributes:
                        
                        attributes = re.findall(attribute_capture, tag_attributes)

                        attribute_string = " "
                        # copy all attributes directly except for internal links
                        for i in range(len(attributes)):
                            
                            # only modify the href or src attributes that don't point to a webpage
                            if(attributes[i][0] == "href" or attributes[i][0] == "src") and (attributes[i][1][:4] != "http"):
                                asset_path = os.path.abspath(os.path.join(template_origin, attributes[i][1]))
                                endpoint_name = os.path.basename(asset_path)

                                output_map[endpoint_name] = asset_path
                                attribute_string += f"{attributes[i][0]} = \"/{endpoint_name}\" "
                            else:
                                attribute_string += f"{attributes[i][0]} = \"{attributes[i][1]}\" "

                        closing = ">"
                        # edge case self closing tag: <link/> check the char before the closing > to see if it's a /, if it is, add that
                        if line[span[1] - 2]  == "/":
                            closing = "/" + closing
                        # rebuild the tag with the new attributes
                        line = line[:span[0]] + f"<{tag_name}{attribute_string[:-1]}{closing}" + line[span[1]:]
                    # write the line to the output file
                    outfile.write(line)

    for key in output_map:
        print(f"{key} -> {output_map[key]}" )
    with open(os.path.join(template_destination, "endpoints.json"), "w") as f:
        json.dump(output_map, f)

    return True

if __name__ == "__main__":
    # defaults: 
    template_folder = "./src/templates"
    output_folder = "./build"

    if len(sys.argv) != 3:
        raise ValueError("Usage: EndpointGenerator.py input/folder/path output/folder/path")

    e_gen = generate_endpoints(sys.argv[1], sys.argv[2])