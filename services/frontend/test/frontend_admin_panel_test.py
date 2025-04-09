from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains
import time
import os

"""
# Next 2 lines are needed to specify the path to your geckodriver
geckodriver_path = "/snap/bin/geckodriver"
driver_service = webdriver.FirefoxService(executable_path=geckodriver_path)

driver = webdriver.Firefox(service=driver_service)"""

# Start the browser""
url_front = "http://localhost:3001";
# prod env : 
# url_front = os.get



def open_webpage (webpage) : 
    # Open a webpage
    driver = webdriver.Firefox()
    driver.get(webpage)
    driver.maximize_window()
    return driver


# 1 Test description des chemins
def test_card_descriptions():
    card_descriptions = {
        "Utilisateurs": "Gestion des utilisateurs",
        "Visiteurs": "Monitoring du trafic",
        "API": "Monitoring des APIs",
        "System Monitoring": "Contrôles des metrics système",
        "Database Monitoring": "Contrôles des metrics DB",
        "Alertes": "Gestion des alertes et notifications"
    }
    
    driver = open_webpage(url_front + "/dashboard_admin/")

    for title, description in card_descriptions.items():
        try:
            card = driver.find_element(By.XPATH, f"//h2[contains(., '{title}')]")
            card_description = card.find_element(By.XPATH, "./../p").text  # Go one level up to find description
            assert description in card_description
            print(f"Description for '{title}' test passed.")
        except Exception as e:
            print(f"Error when checking description for '{title}'. Error: {e}")

    driver.quit()



# 2 Test liaison carte / chemin
def test_card_navigation():
    card_info = [
        ("Utilisateurs", "/dashboard_admin/users"),
        ("Visiteurs", "/dashboard_admin/visitors"),
        ("API", "/dashboard_admin/apis"),
        ("System Monitoring", "/dashboard_admin/system"),
        ("Database Monitoring", "/dashboard_admin/database"),
        ("Alertes", "/dashboard_admin/alerts")
    ]
    i = 0
    for title, expected_url in card_info:
        try  : 

            driver = open_webpage(url_front + "/dashboard_admin/")  
            grid = driver.find_element(By.CLASS_NAME, "grid")
            # find all descendants
            children_elements = grid.find_elements(By.XPATH, "./*") 
            assert(len(children_elements) == len(card_info))

            # click on each card
            children_elements[i].find_element(By.XPATH, f"//*[contains(text(), '{title}')]")
            print(children_elements[i])
            actions = ActionChains(driver)
            actions.move_to_element(children_elements[i]).click().perform()
            time.sleep(2)  

            # check the adress
            assert driver.current_url ==f"{url_front}{expected_url}"
            print(f"Navigation to '{title}' test passed.")
            i+=1

        except NoSuchElementException as e:
            print(f"Error when clicking on card '{title}'. Error: {e}")

        finally : 
            driver.quit()

# 3 Test creation user
def test_create_user():
    driver = open_webpage(url_front + "/dashboard_admin/users")


    add_user_button = driver.find_element(By.CSS_SELECTOR, ".w-5 > path:nth-child(3)")
    add_user_button.click()
    
    WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "modal-title")))
    
    # fill out the form
    lname_input = driver.find_element(By.ID, "lname")
    lname_input.send_keys('lname_test')
    
    fname_input = driver.find_element(By.ID, "fname")
    fname_input.send_keys('fname_test')

    email_input = driver.find_element(By.ID, "email")
    email_input.send_keys('email@gmail.com')

    # unsafe pwd
    pwd_input = driver.find_element(By.ID, "password")
    pwd_input.send_keys('pwd')

    cpwd_input = driver.find_element(By.ID, "cpassword")
    cpwd_input.send_keys("pwd")

    role_liste = driver.find_element(By.ID, "role")
    actions = ActionChains(driver)
    actions.move_to_element(role_liste).perform()
    actions.click().perform()
    user_role = driver.find_element(By.XPATH, "//select[@id='role']/option")
    time.sleep(3)

    create_user = driver.find_element(By.XPATH, "//button[contains(.,'Créer')]")   
    create_user.click(); 

    # check unsafe pwd detected
    WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "1")))
    # check EC.alertispresent

    pwd_input.send_keys("r%6Ut^p6Gdr&63Z")
    cpwd_input.send_keys("r%6Ut^p6Gdr&63Z")
    create_user.click();

    WebDriverWait(driver, 5).until(EC.invisibility_of_element((By.ID, "modal-title")))
    driver.find_element(By.XPATH, "//td[contains(., lname_test)]")


    driver.quit()





