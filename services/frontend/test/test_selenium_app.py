from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


from selenium.webdriver.common.action_chains import ActionChains
import time

# Start the browser
driver = webdriver.Firefox()  # Make sure chromedriver is installed
url_front = "http://localhost:3001/";


def open_webpage (webpage) : 
    # Open a webpage
    driver.get(webpage)
    driver.maximize_window()

#------------- working well ----   issues with simultaneous selenium calls -------   possible to bypass by calling functions independetantly


def test_menu () : 
    try:
        # Open the webpage
        open_webpage(url_front);

        # Find the navigation menu
        menu = driver.find_element(By.TAG_NAME, "nav")
        
        # Find the first link in the navigation menu
        accueil = menu.find_elements(By.XPATH, ".//a")[0]
        
        # Example: You might want to print or click the link
        print(accueil.text)
        accueil.click()  # You can perform other actions like clicking on the link


        # -------------- click on carte ---------------------
        menu.find_elements(By.XPATH, ".//a")[1].click(); #imporve this find element

        # Wait for the new page to load (for example, wait for an element that is unique to the new page)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "map")))
        
        # Get the updated current URL after the page has loaded
        current_url = driver.current_url
        
        # Verify that the URL matches the expected one
        expected_url = url_front + "map"
        assert current_url == expected_url, f"Expected URL {expected_url}, but got {current_url}"


    finally:

        time.sleep(4)
    
        # Close the browser window
        driver.quit()



# def test_search_bar_not_complete(): 
#     open_webpage(url_front+ "map/");
 
#     # Locate the search bar using name attribute
#     search_box = driver.find_element(By.TAG_NAME, 'input');

#     time.sleep(3);

#     # Type something in the search box
#     search_box.send_keys("C")
    
#     # check that list is limited to Batia
#     bastia = driver.find_elements(By.TAG_NAME, 'li');
#     assert (len(bastia) > 1); 

    
#     # Close the browser
#     driver.quit()



def test_search_bar_not_complete(): 
    open_webpage(url_front+ "map/");
 
    # Locate the search bar using name attribute
    search_box = driver.find_element(By.TAG_NAME, 'input');

    time.sleep(3);

    # Type something in the search box
    search_box.send_keys("C")
    
    # check that list is limited to Batia
    bastia = driver.find_elements(By.TAG_NAME, 'li');
    assert (len(bastia) > 1); 

    time.sleep(3)    
    # Close the browser
    driver.quit()



def test_search_bar_choose_station():
    open_webpage(url_front+ "map/");
    
    search_wrapper = driver.find_element(By.CLASS_NAME, 'items-start');
 
    # Locate the search bar using name attribute
    search_box = search_wrapper.find_element(By.XPATH, ".//input[@type='text']"); #shitty element finder

    time.sleep(4);

    # Type something in the search box
    search_box.send_keys("bastia")
    
    # check that list is limited to Batia
    bastia = search_wrapper.find_elements(By.XPATH, ".//li")
    assert (len(bastia) == 1); 

    time.sleep(4)    

    # test affichage
    bastia[0].click();
    
    # Wait for the new page to load (for example, wait for an element that is unique to the new page)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "tempChartContainer")))
    
    # Get the updated current URL after the page has loaded
    current_url = driver.current_url
    
    # Verify that the URL matches the expected one
    expected_url = url_front + "stations/bastia"
    assert current_url == expected_url, f"Expected URL {expected_url}, but got {current_url}"

    time.sleep(4);
    
    # Close the browser
    driver.quit()




def test_searchbar_wrong_input () :
    
    open_webpage(url_front+ "map/");
 
    # Locate the search bar using name attribute
    search_box = driver.find_element(By.TAG_NAME, 'input');

    time.sleep(1);

    # Type something in the search box
    search_box.send_keys("tureeri")
    
    # check that list is limited to Batia
    bastia = driver.find_elements(By.TAG_NAME, 'li');
    assert (len(bastia) == 0 );  

    time.sleep(3);

    # Close the browser
    driver.quit()


# ----------------------- END working well ------------ issues with simultaneous selenium calls


# ----------------------- functions left to code ------------ 

# def test_test_graph_Bastia () : 
#     open_webpage(url_front + "stations/bastia")
    
#     # check Bastia Graphs
#     graph_temperature_container = driver.find_element(By.ID, 'tempChartContainer');
#     graph_humidity_container = driver.find_element(By.ID, 'humidityChartContainer');


#     # gros pb dans la construction du site --> multiple canvases
#     canvas_temp = graph_temperature_container.find_elements(By.TAG_NAME, './/canvas');

#     is_empty = driver.execute_script("""
        
#         var tempContainer = arguments[0];
#         let temp_canva =  tempContainer.getElementsByClassName("canvasjs-chart-canvas")[0];
#         const pixelBuffer = new Uint32Array(
#             context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
#         );

#         return !pixelBuffer.some(color => color !== 0);
#         //  return true;  // If all pixels are transparent, return true
#         """, graph_temperature_container);

#     driver.quit()
